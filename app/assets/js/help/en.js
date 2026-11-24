// Detailed help for each page (en): what you see when you press “?”. Each entry has an opening
// sentence, parts [title, text], tips and the chapter of the app guide that explains it at
// length. Pages not listed here show only their short sentence (help.<section> in i18n/en.js).
export default {
  home: {
    intro: 'What is worth seeing on arrival: where to pick up, how you are doing, how much is left and what needs reviewing.',
    parts: [
      ['Where to pick up', 'The last scene you touched and the next one still to be written, one click away. “Keep writing” opens the first. In a new project, the first steps are shown here.'],
      ['Four figures', 'The manuscript against its word target, what you wrote today against the daily quota, the streak of days in a row and the days left until the deadline, with the pace you need and the one you keep.'],
      ['Pace and status', 'The words of each of the last 30 days and how many sheets, chapters and scenes are to do, in progress or finished.'],
      ['To review', 'The most recent open tasks and the warnings: impossibles and warnings from Continuity, scenes with no date and scenes with no strand.'],
    ],
    tips: [
      'Targets are set in “Book → Goals”. Without them, the figures show only what there is.',
      'If you added a cover or a tagline in “Book”, they appear in the first block; click the cover to see it full size.',
      'On the PC, right-click any link → “Open in a new window”: for example, a character’s sheet next to the scene you are writing.',
      'On the phone, if you leave a scene to look something up, the ↩ button at the top takes you back to it.',
    ],
    guide: 'path#home',
  },
  architecture: {
    intro: 'The foundations of the story: what you tell, in which world and along which threads.',
    parts: [
      ['Premise', 'The idea in a sentence or two: who wants what and what stands in the way.'],
      ['Fabula, setting and notes', 'The events in chronological order, the time and place, and the notes that affect the whole novel. Click each block to write it.'],
      ['Strands', 'One narrative thread per row, grouped by weight: main plots, subplots and background. The classification is set on each strand’s sheet.'],
      ['How each strand runs', 'The bar has one mark per scene of the book, in reading order; the coloured ones belong to that strand. You can see where it starts, where it vanishes and whether it reaches the end.'],
    ],
    tips: [
      'Scenes are assigned to a strand on the scene sheet, “Plots and objects” block.',
      'The “scenes with no strand” notice points at scenes that may not move anything forward.',
      '“Read it all” shows the architecture straight through, like a document.',
      '“Import / export”, next to “Add strand”, takes the strands out to Excel, CSV, Word, text or JSON and brings them back.',
    ],
    guide: 'plan#architecture',
  },
  notes: {
    intro: 'Loose notes for the project: ideas, fragments, reminders.',
    parts: [
      ['Tags', 'Each note can have several. Here they are grouped by tag, and a note with two tags appears in both blocks.'],
      ['Colour', 'Eight colours to tell them apart at a glance. “Arrange by: Colour” groups them that way.'],
      ['Links', 'A note can be linked to characters, locations, objects, groups, custom sheets, strands, chapters and scenes. It then shows on each one’s sheet.'],
      ['Order and upkeep', 'Inside each block you reorder by dragging. A tag’s ⋯ menu renames it or removes it from all its notes.'],
    ],
    tips: ['For reference material (links, plans, articles) Documentation is better; for things to check, To-dos.'],
    guide: 'plan#notes',
  },
  library: {
    intro: 'The novel’s reference material: links, articles, images, maps, plans and documents.',
    parts: [
      ['References', 'Each has a kind, an optional web address, a text and attached files (images, SVG or PDF).'],
      ['Links', 'A reference is linked to scenes, chapters or sheets and shows up on them, so it is at hand while you write that scene.'],
    ],
    guide: 'plan#library',
  },
  characters: {
    intro: 'The sheets of the people who live the story.',
    parts: [
      ['Main and secondary', 'Main characters have an interview by sections (personal data, appearance, psychology, conflict, evolution…); secondary ones, a free description. You can turn one into the other from its sheet.'],
      ['Detection in the text', 'If you create the characters before writing, scenes recognise them by name and aliases and tag them by themselves.'],
      ['Dates and age', 'With a birth date on the sheet, every dated scene shows the character’s age.'],
      ['Relationships', 'Once a character has a relationship drawn in “Relationships”, a tab appears here bringing them all together.'],
    ],
    tips: ['“Import / export” takes the list out to Excel, CSV, Word, text or JSON, and brings it back. Each sheet goes whole: data, text, traits, events, scenes it appears in and relationships.'],
    guide: 'world#characters',
  },
  'characters.item': {
    intro: 'A main character’s sheet: an interview by sections that helps you get to know them.',
    parts: [
      ['Sections', 'Each section can be answered question by question or as free text. Its status (to do, in progress, finished) tells you what is left.'],
      ['Traits', 'They are extracted from what you write (age, hair, eyes…) so you do not contradict yourself; you can add your own.'],
      ['Role, aliases and dates', 'The role in the story, the other names they go by (so the text recognises them) and their birth and death.'],
      ['Relationships', 'One pair per relationship: under each one’s picture, what they are to the other (“Flight director” / “Commander”). If you fill in only one, it holds for both (“Colleagues”). It is a single list, whether the relationship is recorded here, on the other’s sheet or drawn on a map; changing or removing it updates all those places.'],
      ['Images, events and appearances', 'Reference pictures, dated facts for the timeline and the scenes they are in.'],
    ],
    tips: [
      'If they keep appearing after dying (their body, a memory, a ghost), tick the box under the death date and Continuity will not warn.',
      'The ⋯ menu exports the sheet or imports data into it.',
    ],
    guide: 'world#characters',
  },
  locations: {
    intro: 'The settings of the novel, from the largest to the smallest.',
    parts: [
      ['List', 'The sheets of all locations, which you reorder by dragging.'],
      ['Tree', 'Which location is inside which: the room in the deck, the deck in the ship. What happens in a location also counts for those containing it.'],
      ['Maps', 'You upload a plan or a map (image or SVG) and place your locations on it with pins.'],
      ['Relationships', 'Appears when a location has a relationship drawn in “Relationships”.'],
    ],
    tips: ['In the tree, each row’s ⋯ menu moves it inside another location or adds locations inside it.'],
    guide: 'world#locations',
  },
  'locations.item': {
    intro: 'A location’s sheet.',
    parts: [
      ['Where it is', 'Country, region and city, and “Inside”: the location that contains it. “Contains” lists the ones inside it.'],
      ['Description and questions', 'The free text and the custom questions you defined for all locations.'],
      ['Appearances', 'The scenes that happen here or in any of the locations it contains.'],
    ],
    guide: 'world#locations',
  },
  custom: {
    intro: 'Sheets of the types you define yourself: ships, technologies, creatures, organisations…',
    parts: [
      ['Types', '“Add type” creates one with its name, icon and fields. Each type is a tab.'],
      ['Sheets', 'They have their type’s fields plus a description, images and an identifier.'],
      ['Like any other item', 'They are tagged in scenes (“Plots and objects” block), appear on the timeline and in search, and take part in Continuity.'],
    ],
    guide: 'world#things',
  },
  relationships: {
    intro: 'How the elements of the novel relate: what you draw and what is worked out automatically.',
    parts: [
      ['My maps', 'You can have several: the family, the crew, the factions. Each one is a canvas.'],
      ['Items and arrows', 'On a map you add sheets (or free texts) and join two with a labelled arrow: “mother of”, “enemy of”, “works for”.'],
      ['Automatic', 'Ten drawings that come from what is already recorded: who shares scenes, who holds each object, who knows each secret, what an event links, characters and locations, characters and strands, journeys, groups, locations inside locations and relationships (everything recorded on sheets and maps, plus the siblings and grandparents deduced). They are not saved: they are worked out on opening.'],
      ['Everything together', 'A general drawing with yours (solid line) and the automatic ones (dashed, each in its colour), with checkboxes to choose which are shown.'],
      ['Reading a drawing', 'The thicker the line, the more often the relationship occurs. Hover over an element, or click it to pin it, and its relationships are highlighted with their label. The list is below.'],
      ['Seeing them on sheets', 'Characters and Locations have a “Relationships” tab that gathers those from all your maps.'],
    ],
    tips: ['“Export relationships” takes them out to Word, text, Excel, CSV or JSON.', 'A “mother”, “father” or “son” arrow between two characters also lets Continuity check their birth dates.'],
    guide: 'world#auto',
  },
  chapters: {
    intro: 'The structure of the novel: parts, chapters, prologue and epilogue.',
    parts: [
      ['The list', 'Each chapter with its scenes, words, reading time, status, the characters most present and one coloured square per strand it touches. Above, the book total.'],
      ['Reading time', 'Approximate, at about 250 words per minute. Inside each chapter, each scene shows its own too.'],
      ['The strands', 'Hover a square (or press and hold on a touch screen) to see the strand’s name, kind and description.'],
      ['Reordering', 'Drag the rows, use Alt+↑/↓ or each row’s ⋯ menu.'],
      ['Other views', '“Board” shows the scenes as cards to move between chapters; “Outline”, everything as a tree.'],
    ],
    tips: ['“Structure” adds parts, a prologue or an epilogue, imports a Word draft and detects mentions in every scene.'],
    guide: 'write#structure',
  },
  'chapters.item': {
    intro: 'A chapter: its scenes and its notes.',
    parts: [
      ['Scenes', 'You create them, reorder them by dragging and move them to another chapter from their ⋯ menu. Under each title: when it happens and how long it lasts, who narrates and a coloured square for each location (hover, or press and hold, to see which one).'],
      ['Purpose and notes', 'What the chapter is for in the novel and whatever you want to remember while writing it.'],
    ],
    guide: 'write#structure',
  },
  'scenes.item': {
    intro: 'Where you write. On the left, the text; on the right, the scene sheet.',
    parts: [
      ['The text', 'It saves itself. The toolbar gives formatting, dialogue dash and quotes, find and replace, and marking a to-do on the selection.'],
      ['The sheet', 'In collapsible blocks: who is in it and who narrates, where and when, plots and objects, continuity, to-dos, reference material and revisions.'],
      ['Events', 'The “Events” block shows the facts that have to do with the scene: those that happen in it (they take its date) and those told in it (a memory: they keep their own). Folded, it names them; open, it gives each one’s date, description, whom it affects and which other scenes hold it.'],
      ['Automatic detection', 'What you name in the text (characters, locations, objects, groups) is tagged by itself, marked “auto”. If you remove it, it is not added again.'],
      ['Revisions', 'Versions of the scene’s text. You can create a new one before rewriting, compare them and go back to an earlier one.'],
      ['Tools', 'On the toolbar: split view (a sheet or another scene alongside), style check, read aloud and distraction-free mode.'],
      ['Continuity', 'Note here what changes state (“wounded in the arm”, “the key passes to Alex”) and which secret is revealed, and to whom.'],
    ],
    tips: ['Ctrl+S saves at once; Ctrl+F searches; Esc leaves distraction-free mode.', 'The scene’s date places it on the timeline and makes it possible to work out ages and detect impossibilities.'],
    guide: 'write#sheet',
  },
  board: {
    intro: 'The scenes as cards, to see the novel at a glance and rearrange it.',
    parts: [
      ['Columns and cards', 'Each chapter is a column (four per row) and each scene a card with its summary, who narrates, where and when.'],
      ['Summary', 'Click a card’s text to write what the scene is about.'],
      ['Moving', 'Drag a card to move it or change its chapter. On touch screens, use its ⋯ menu.'],
      ['Strands', 'The coloured bars are the scene’s strands; the legend above says which is which.'],
    ],
    guide: 'write#board',
  },
  book: {
    intro: 'Everything that describes the novel as a book.',
    parts: [
      ['Book details', 'Title and language (required) and author, series, number, publication date, publisher, cover and synopsis (optional). They appear on the title page and in the ebook metadata.'],
      ['Goals', 'Word target, daily quota, deadline and words per chapter. You follow them from the home page.'],
      ['Book pages', 'Copyright page, dedication, epigraph, acknowledgments and “About the author” with a photo. They are added on export.'],
      ['Project', 'Backup (a .zip with all the data, the images and documents, and the book and sheets in Word), creating a sequel (keeps the world, starts with no chapters) and deleting the project. The backup is restored with “Import backup” in “Your projects”.'],
    ],
    tips: ['With no author, the book is exported as “Anonymous”.'],
    guide: 'book#data',
  },
  tasks: {
    intro: 'What is left to review, in one place.',
    parts: [
      ['Where they come from', 'From a mark on a scene’s text, or standalone, tied to a sheet or to the project.'],
      ['Kinds and status', 'Each to-do has a kind (revise, check, research…) and is marked resolved when it is.'],
      ['Going there', 'From a to-do marked on the text you jump to the exact sentence in the scene.'],
    ],
    guide: 'review#tasks',
  },
  timeline: {
    intro: 'The facts in order: dated scenes and the events of the world.',
    parts: [
      ['What shows up', 'A scene appears once you give it a date on its sheet. An event is created here or on an item’s sheet, and can be general or belong to one or several items.'],
      ['Events and scenes', 'An event is linked to the scenes where it happens (it takes their date and is shown inside them) or where it is only told (it keeps its own). If a loose event has the same date and time as a scene, a notice offers to link them.'],
      ['Two orders', '“Chronological” sorts by date; “Reading”, as in the book, to see where the story jumps back.'],
      ['The book begins and ends', 'Two markers show the first and last scene the reader meets: what comes before is the past prior to the novel.'],
      ['Follow and filters', '“Follow” narrows the line to a single item; the checkboxes hide kinds of entry.'],
      ['Search', 'By text, date or identifier. “a & b” requires both; “a | b”, either. The “?” next to it gives examples.'],
      ['Import and export', 'To CSV, JSON, Excel or Word, and back: it creates the missing events and updates the existing ones.'],
    ],
    tips: ['Between two entries the time that passes is shown; hovering breaks it down.'],
    guide: 'time#timeline',
  },
  continuity: {
    intro: 'So you do not contradict yourself: detectable impossibilities, who knows what, and how each item changes.',
    parts: [
      ['Checks', 'It crosses scene dates and locations, characters present, births and deaths, states and secrets. It warns, for instance, about someone in two places at once.'],
      ['Impossible or to review', 'What cannot be is shown as “Impossible”; what may be intentional, as “To review”. Each notice can be ignored.'],
      ['Who knows what', 'The secrets of the novel, one per row, and the scene where each character and the reader find out. They are sorted by their first reveal (by date or in reading order), and the search box finds by title, content, person or scene. Click a row to see the details.'],
      ['Tracking', 'Walks through the book following one item: where it appears and how its state changes.'],
    ],
    tips: ['States and reveals are noted on each scene sheet, “Continuity” block.', 'The more you fill in (dates, locations, births), the more it finds.'],
    guide: 'continuity#checks',
  },
  analysis: {
    intro: 'Measurements of the manuscript and of the way you write it.',
    parts: [
      ['My writing', 'Words per day, streaks, sessions and a finish forecast.'],
      ['The book', 'Chapter and scene length, proportion of dialogue and narration, and repetitions.'],
      ['Style', '-ly adverbs, close repetitions, filler words and long sentences, by chapter; it highlights where there is more. It follows the rules of the novel’s language.'],
      ['Narrative chart', 'One row per item and one column per scene: who vanishes for too long and which strands never cross.'],
      ['Distribution and appearances', 'In how many scenes of each chapter each item appears, and the list of a character’s scenes.'],
    ],
    tips: ['The “?” next to each column explains what it measures.'],
    guide: 'analysis',
  },
  search: {
    intro: 'Find (and replace) across the whole project.',
    parts: [
      ['Where it looks', 'Tick the scopes: scene text, titles, characters, world, architecture and notes, reference material and to-dos.'],
      ['Options', 'Match case and whole words only.'],
      ['Replace', 'Changes the text in everything ticked, after telling you in how many places. Handy for renaming a character.'],
    ],
    guide: 'review#search',
  },
  export: {
    intro: 'Take the novel or the working material out to a file.',
    parts: [
      ['What to export', 'The novel or the dossier (architecture, characters, locations and the other sheets).'],
      ['Kinds of export', 'Manuscript for submission, print book (with page and spine estimate), ebook (EPUB) or free format.'],
      ['Formats', 'Word, EPUB, web page or PDF, and text.'],
      ['Book details and pages', 'The title page, the ebook metadata, the cover and the front and back matter come from “Book”.'],
    ],
    guide: 'book#export',
  },
  trash: {
    intro: 'What you delete is not lost at once: it comes here.',
    parts: [
      ['Restore', 'Puts an item back in its place, along with what hung from it.'],
      ['Expiry', 'After the days you set in Settings (between 1 and 60), it is deleted for good.'],
    ],
    guide: 'data#trash',
  },
};
