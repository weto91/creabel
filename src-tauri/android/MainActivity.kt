// Actividad principal de Creabel en Android. Sustituye a la que genera Tauri
// (`tauri android init`): los flujos de GitHub Actions la copian encima en cada compilación.
//
// Desde Android 15 las aplicaciones se dibujan de borde a borde, por debajo de la barra de
// estado y de la de navegación, y solo las versiones muy recientes de WebView avisan a la página
// de ese espacio. Aquí se resuelve de forma nativa para cualquier versión:
//  - la vista principal deja libre el espacio de las barras del sistema (y de la cámara), con el
//    color de la barra de Creabel detrás;
//  - cuando se abre el teclado, la vista se encoge hasta su borde, para que no tape lo que se
//    está escribiendo;
//  - a la WebView se le pasan esas medidas a cero, para que la página no deje otro hueco igual.
//
// Permiso de red local: desde Android 17, sin ACCESS_LOCAL_NETWORK la aplicación no puede
// conectar con el PC emparejado ni con un NAS de casa (Android lo bloquea sin avisar: las
// conexiones se quedan sin respuesta). El permiso se declara en el manifiesto durante la
// compilación (scripts/android-manifest.mjs) y se pide cuando hace falta, desde la página, con
// el puente `window.CreabelAndroid`:
//  - localNetworkState(): "granted" (o no hace falta: Android 16 o anterior), "prompt" (aún no
//    se ha preguntado), "prompt-with-rationale" (se dijo que no: conviene explicar para qué) o
//    "denied" (denegado para siempre: solo se puede dar en los ajustes);
//  - requestLocalNetwork(): enseña el aviso de Android; la respuesta llega a la página con el
//    evento `creabel:local-network` (detail: el estado nuevo);
//  - openAppSettings(): abre los ajustes de Creabel en Android.
//
// Cierres inesperados: si la aplicación se cierra sola por un error, se apunta qué falló en un
// archivo de sus datos (no sale del dispositivo) y la página lo enseña en Ajustes → Acerca de,
// para poder copiarlo y avisar: lastCrash() devuelve el texto y clearLastCrash() lo borra.
package io.github.weto91.creabel

import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private const val LOCAL_NETWORK = "android.permission.ACCESS_LOCAL_NETWORK"
private const val PREFS = "creabel"
private const val ASKED = "localNetworkAsked"
private const val CRASH_FILE = "ultimo-cierre.txt"
private var crashRecorderInstalled = false

class MainActivity : TauriActivity() {
  private var page: WebView? = null
  private lateinit var localNetworkLauncher: ActivityResultLauncher<String>

  // Apunta el error que cierra la aplicación y deja que Android siga con lo suyo.
  private fun installCrashRecorder() {
    if (crashRecorderInstalled) return
    crashRecorderInstalled = true
    val file = File(filesDir, CRASH_FILE)
    val previous = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, error ->
      try {
        val head = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date()) +
          " · Creabel " + (packageManager.getPackageInfo(packageName, 0).versionName ?: "?") +
          " · Android " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")" +
          " · " + Build.MANUFACTURER + " " + Build.MODEL
        file.writeText((head + "\n" + Log.getStackTraceString(error)).take(20000))
      } catch (ignored: Throwable) {
        // Si no se puede apuntar, no se apunta.
      }
      previous?.uncaughtException(thread, error)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    installCrashRecorder()
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // Se registra al crear la actividad (Android lo exige antes de que se vea).
    localNetworkLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { _ ->
      getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(ASKED, true).apply()
      notifyLocalNetwork()
    }

    val root = findViewById<View>(android.R.id.content)
    // Detrás de las barras, el color de la barra superior de Creabel (--side-bg en app.css), que
    // es oscuro en los dos temas: los iconos del sistema (hora, batería…) van en claro.
    val night = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    root.setBackgroundColor(Color.parseColor(if (night) "#0f1316" else "#22303a"))
    WindowCompat.getInsetsController(window, root).apply {
      isAppearanceLightStatusBars = false
      isAppearanceLightNavigationBars = false
    }

    ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
      val bars = WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
      val ime = WindowInsetsCompat.Type.ime()
      val b = insets.getInsets(bars)
      val k = insets.getInsets(ime)
      view.setPadding(b.left, b.top, b.right, maxOf(b.bottom, k.bottom))
      WindowInsetsCompat.Builder(insets)
        .setInsets(bars, Insets.NONE)
        .setInsets(ime, Insets.NONE)
        .build()
    }
  }

  // Tauri crea la WebView y llama aquí antes de cargar la página: el puente ya está desde el
  // principio.
  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    page = webView
    webView.addJavascriptInterface(CreabelBridge(), "CreabelAndroid")
  }

  private fun localNetworkState(): String {
    if (Build.VERSION.SDK_INT < 37) return "granted"
    if (ContextCompat.checkSelfPermission(this, LOCAL_NETWORK) == PackageManager.PERMISSION_GRANTED) return "granted"
    if (shouldShowRequestPermissionRationale(LOCAL_NETWORK)) return "prompt-with-rationale"
    val asked = getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean(ASKED, false)
    return if (asked) "denied" else "prompt"
  }

  private fun notifyLocalNetwork() {
    val state = localNetworkState()
    page?.post {
      page?.evaluateJavascript("window.dispatchEvent(new CustomEvent('creabel:local-network', { detail: '$state' }))", null)
    }
  }

  inner class CreabelBridge {
    @JavascriptInterface
    fun lastCrash(): String = try {
      val file = File(filesDir, CRASH_FILE)
      if (file.exists()) file.readText() else ""
    } catch (ignored: Throwable) {
      ""
    }

    @JavascriptInterface
    fun clearLastCrash() {
      try { File(filesDir, CRASH_FILE).delete() } catch (ignored: Throwable) { /* nada que hacer */ }
    }

    @JavascriptInterface
    fun localNetworkState(): String = this@MainActivity.localNetworkState()

    @JavascriptInterface
    fun requestLocalNetwork() {
      runOnUiThread {
        if (this@MainActivity.localNetworkState() == "granted") notifyLocalNetwork()
        else localNetworkLauncher.launch(LOCAL_NETWORK)
      }
    }

    @JavascriptInterface
    fun openAppSettings() {
      runOnUiThread {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", packageName, null))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
      }
    }
  }
}
