# Course production and platforms (LMS, SCORM, Classroom)

> Distilled from: course-export (savvides/idstack, MIT); assessment-architect's LMS export format reference (YujxZJCN/teaching-skills, MIT); gws-classroom (googleworkspace/cli, Apache-2.0); openmaic (THU-MAIC/OpenMAIC, MIT). Plus general knowledge of IMS Common Cartridge, QTI, SCORM 1.2 and Moodle GIFT. Specs and platform menus change: check the current docs for your LMS before a real import.

Getting a finished course into the place learners will use it, and checking it works there. Content first; packaging is the last step.

## 1. Pick the route

| Target | Route | Needs | Best for |
|---|---|---|---|
| Canvas, Moodle, Blackboard, D2L/Brightspace | IMS Common Cartridge `.imscc` import | Nothing but the file | A full course shell: pages, assignments, quizzes, discussions in modules |
| Canvas, directly | Canvas REST API push | Institution URL, the teacher's access token, course id | Updating a live course shell without a file import |
| Any LMS quiz bank | QTI quiz file; GIFT text for Moodle | Nothing but the file | Moving a question bank without the whole course |
| Corporate LMS (and most academic LMSs) | SCORM 1.2 `.zip` | Nothing but the file | Self-paced modules that report launch or completion |
| Google Classroom | `gws classroom` CLI or the Classroom API | `gws` installed and Google sign-in by the user | Classes already run in Google Workspace |
| Standalone | Single-file HTML lessons or a small static site | Hosting | Public or self-paced courses outside an LMS ([materials-to-course.md](materials-to-course.md)) |
| Generated interactive classroom | OpenMAIC | Self-hosted with the user's own model keys, or the project's hosted demo with an access code | Turning a topic or PDF into slides, narration, AI teacher and classmates, quizzes |

Ask which LMS and version before building. If unknown, Common Cartridge is the safest file to hand over.

## 2. Content shape before packaging

Have these ready as files, one per item: `syllabus.md`, `module-01.md`..., `assessment-01.md` (with its rubric), `quiz-01.json`, `discussion-01.md`. Quiz questions in one neutral shape make every export target easy:

```json
{ "title": "Week 3 quiz",
  "questions": [
    { "type": "multiple_choice", "id": "q1", "prompt": "...", "points": 1,
      "choices": ["...", "...", "...", "..."], "answer": 2,
      "feedback": "Why the right answer is right" },
    { "type": "multiple_answer", "prompt": "...", "choices": ["..."], "answer": [0, 2] },
    { "type": "true_false", "prompt": "...", "answer": false },
    { "type": "short_answer", "prompt": "...", "answers": ["mitosis", "cell division"] },
    { "type": "essay", "prompt": "...", "points": 10 } ] }
```

Include elaborated feedback per question: why the answer is right, not just "correct". Exotic types (matching, numeric with tolerance, cloze) often need hand-fixing after import.

## 3. IMS Common Cartridge (.imscc)

A zip with `imsmanifest.xml` at the root plus content files:

```
imsmanifest.xml
syllabus.html
modules/mod-1-page-1.html
assignments/assign-1.xml
quizzes/quiz-1.xml          (QTI)
discussions/disc-1.xml
```

Manifest essentials (Common Cartridge 1.3):
- `<metadata>` with schema `IMS Common Cartridge`, version `1.3.0`, and the course title.
- `<organizations>` holds one `rooted-hierarchy` organization; one `<item>` per module with nested items for its pages, assignments, quizzes and discussions.
- `<resources>`: one `<resource>` per item, with `type` such as `webcontent` (pages), `assignment_xmlv1p0`, `imsqti_xmlv1p2/imscc_xmlv1p0/assessment` (quizzes), `imsdt_xmlv1p0` (discussions), and a `<file href>` for each file.
- Every item's `identifierref` matches a resource `identifier`. Use readable ids (`mod-1-page-1`, not `item-47`) and a fresh UUID for the manifest identifier.

Pages: clean, minimal HTML with semantic headings, tables and lists; no external CSS (the LMS applies its own theme), images packaged beside the page. Assignments: title, HTML description with the rubric as a table, points, submission types. Quizzes: QTI with one item per question, the correct response, scoring and feedback.

Package and verify:

```bash
cd build && zip -r ../course.imscc . && cd ..
unzip -l course.imscc                 # imsmanifest.xml at the root?
# every <file href> in the manifest exists in the zip; counts of pages/assignments/quizzes as expected
```

## 4. SCORM 1.2 package

```
imsmanifest.xml
content/module-01.html
content/module-02.html
```

- Manifest: metadata schema `ADL SCORM`, version `1.2`; an `<organizations default=...>` with one `<item>` per module pointing at a `<resource type="webcontent" adlcp:scormtype="sco" href="content/module-01.html">`; unique identifiers; nested items for sub-modules.
- Pages are self-contained HTML with inline styles.
- A plain static package has no SCORM runtime calls, so the LMS only records that the learner opened it; scores and detailed completion need a SCORM API wrapper or an authoring tool. Say so to the requester.
- Zip so `imsmanifest.xml` sits at the root (`zip -r course-scorm.zip imsmanifest.xml content/`), then verify with `unzip -l`.

## 5. Moodle GIFT (question import)

Plain text, one question per block, blank line between:

```
::Q1:: Which organelle produces most of a cell's ATP? {
  =Mitochondrion#Right: it runs cellular respiration.
  ~Ribosome#Ribosomes build proteins.
  ~Nucleus#The nucleus holds DNA.
}

::Q2:: Water boils at 100 C at sea level. {TRUE}

::Q3:: Name the process plants use to make glucose. {=photosynthesis}
```

`=` marks the right answer, `~` a wrong one, `#` feedback. Escape special characters (`~ = # { } :`) with a backslash. Import in Moodle via the question bank's import page, format GIFT.

## 6. Canvas API push

- The teacher creates or picks an empty course shell and generates their own access token. The token is used only in the API calls of this session: never written to a file, a log or the chat transcript, and discarded afterwards.
- Validate first: `GET /api/v1/users/self`, then `GET /api/v1/courses/<id>`. 401 = bad token; 403 = needs Teacher or Designer role; 404 = wrong course id or URL.
- Confirm the target course name with the user before any write.
- Create in order: modules (`POST /api/v1/courses/<id>/modules`), pages (`/pages`), assignments (`/assignments`), discussions (`/discussion_topics`), then add each to its module (`/modules/<module_id>/items`). Calls go only to the institution's Canvas URL.
- Create everything unpublished so the teacher reviews descriptions, rubrics and due dates before learners see anything.
- Errors: 422 = validation (duplicate titles, missing fields); 429 = rate limited, wait and retry once or twice; on any single failure, log it and continue; finish with a table of what succeeded and what failed.

## 7. Google Classroom via the Workspace CLI

```bash
gws classroom --help                                   # resources and methods
gws schema classroom.courses.courseWork.create         # required params before calling
gws classroom courses list
```

Resources: `courses` (create, get, list, patch, update), and under a course `topics`, `courseWork`, `courseWorkMaterials`, `announcements`, `students`, `teachers`; plus `invitations` and `userProfiles`. Read `gws schema` output to build `--params` and `--json`. The user signs in with their own Google account (see the CLI's shared auth docs). Read-only calls first; confirm every create, update or invitation with the user; never call `delete` on a course or invitation unless the user asked for that exact deletion. Google Docs, Slides and Drive work: `docs-office` → `references/google-workspace.md`.

## 8. OpenMAIC (generated classrooms)

An open-source generator that turns a topic or PDF into a multi-agent interactive classroom. Two ways to run it: the project's hosted Live Demo (needs an access code from the project's site; uploaded material goes to that service) or self-hosted, where the user puts their own model provider keys into the project's config themselves. Don't ask users to paste keys into chat, and confirm before reading or uploading any local file. Use the original skill (Go deeper) for setup, generation and extending its SDK.

## 9. Before learners see it

- Open the imported course in student view; click through every module, link, video and quiz.
- Take each quiz once as a learner; check scoring and feedback.
- Check due dates and time zones, weights in the gradebook, release conditions.
- Run the accessibility table in [differentiation-and-udl.md](differentiation-and-udl.md): captions, alt text, headings, contrast.
- Pilot with a few learners where possible; fix what confused them before launch.

## Checklist

- [ ] LMS and version known; route chosen to match
- [ ] Content as one file per item; quizzes in one neutral shape with feedback
- [ ] Package has `imsmanifest.xml` at the root; every reference resolves; `unzip -l` checked
- [ ] SCORM limits (no tracking without a runtime) stated
- [ ] Tokens never stored; target course confirmed; items created unpublished
- [ ] Classroom writes confirmed one by one; no unasked deletes
- [ ] Clicked through in student view before release
