import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Executive Modern Color Palette
    C_NAVY = RGBColor(15, 23, 42)        # Slate 900
    C_SLATE_BG = RGBColor(248, 250, 252) # Slate 50
    C_CARD_BG = RGBColor(255, 255, 255)  # Crisp White
    C_CARD_BORDER = RGBColor(226, 232, 240) # Slate 200
    C_BLUE = RGBColor(37, 99, 235)       # Primary Blue (600)
    C_DARKBLUE = RGBColor(29, 78, 216)   # Blue 700
    C_CYAN = RGBColor(14, 165, 233)      # Sky 500
    C_TEXT_MAIN = RGBColor(15, 23, 42)   # Slate 900
    C_TEXT_MUTED = RGBColor(71, 85, 105) # Slate 600
    C_GREEN = RGBColor(16, 185, 129)     # Emerald 500
    C_GREEN_DARK = RGBColor(5, 150, 105) # Emerald 600
    C_RED = RGBColor(239, 68, 68)        # Red 500
    C_WHITE = RGBColor(255, 255, 255)
    C_BANNER_BG = RGBColor(241, 245, 249)

    TOTAL_SLIDES = 10

    def add_header(slide, title_text, category_text, mark_pill=""):
        # Header textbox
        hb = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.733), Inches(0.95))
        tf = hb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_BLUE

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = C_TEXT_MAIN

        # Optional rubric mark pill at top-right
        if mark_pill:
            pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.3), Inches(0.45), Inches(2.233), Inches(0.4))
            pill.fill.solid()
            pill.fill.fore_color.rgb = RGBColor(236, 253, 245)
            pill.line.color.rgb = RGBColor(167, 243, 208)
            pill.line.width = Pt(1)
            tf_p = pill.text_frame
            tf_p.word_wrap = True
            tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
            p_m = tf_p.paragraphs[0]
            p_m.text = mark_pill
            p_m.alignment = PP_ALIGN.CENTER
            p_m.font.size = Pt(9.5)
            p_m.font.bold = True
            p_m.font.color.rgb = C_GREEN_DARK

        # Sleek divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = C_CARD_BORDER
        line.line.color.rgb = C_CARD_BORDER

    def add_footer(slide, current_page):
        fb = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.3))
        tf = fb.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"Student Attendance Management System  |  Abhishek VS (24BCE0404) & Ayush Naugariya (24BDS0076)  |  Slot D2  |  Slide {current_page:02d} of {TOTAL_SLIDES:02d}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_MUTED

    def add_card(slide, left, top, width, height, title="", bg_color=C_CARD_BG, border_color=C_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.18), width - Inches(0.5), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = C_BLUE
        return card

    # ==========================================
    # SLIDE 1: COVER SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_NAVY
    bg.line.fill.background()

    tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.1), Inches(11.0), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "BCSE302P — DATABASE SYSTEMS LAB PROJECT"
    p0.font.size = Pt(12.5)
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(96, 165, 250)
    p0.space_after = Pt(6)

    p_rev = tf.add_paragraph()
    p_rev.text = "REVIEW 3: FINAL DEMONSTRATION, EVALUATION & DOCUMENTATION (10 MARKS)"
    p_rev.font.size = Pt(11)
    p_rev.font.bold = True
    p_rev.font.color.rgb = RGBColor(52, 211, 153)
    p_rev.space_after = Pt(16)

    p1 = tf.add_paragraph()
    p1.text = "Student Attendance Management System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "A Full-Stack NoSQL Application with MongoDB Aggregation Pipelines, Atomic bulkWrite() Upserts, Compound B-Tree Indexing & Real-Time Dean Analytics"
    p2.font.size = Pt(15)
    p2.font.color.rgb = RGBColor(203, 213, 225)
    p2.space_after = Pt(28)

    p3 = tf.add_paragraph()
    p3.text = "Team Members: Abhishek VS (24BCE0404)  |  Ayush Naugariya (24BDS0076)"
    p3.font.size = Pt(14)
    p3.font.bold = True
    p3.font.color.rgb = C_WHITE
    p3.space_after = Pt(8)

    p4 = tf.add_paragraph()
    p4.text = "Slot: D2  |  Technology: MongoDB, Express.js, React.js 19, Node.js, Mongoose ODM, Tailwind CSS"
    p4.font.size = Pt(12)
    p4.font.color.rgb = RGBColor(148, 163, 184)

    # ==========================================
    # SLIDE 2: MASTER INDEX & RUBRIC MAPPING
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Presentation Index & Review 3 Rubric Mapping", "BCSE302P Official Evaluation Agenda (30 Marks Total)", "Review 3: 10 Marks")

    # Minimum Requirements Banner
    banner = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.48), Inches(11.733), Inches(0.48))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(236, 253, 245)
    banner.line.color.rgb = RGBColor(167, 243, 208)
    tf_b = banner.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
    p_b = tf_b.paragraphs[0]
    p_b.text = "MINIMUM TECHNICAL REQUIREMENTS COMPLIANCE:   [✓] 6 Collections (min 5)   |   [✓] 2,640+ Documents (min 100)   |   [✓] Full CRUD Complete   |   [✓] 7 Aggregations (min 5)   |   [✓] 6 Indexes (min 2)   |   [✓] Bcrypt + JWT RBAC   |   [✓] Responsive UI"
    p_b.font.size = Pt(8.5)
    p_b.font.bold = True
    p_b.font.color.rgb = C_GREEN_DARK
    p_b.alignment = PP_ALIGN.CENTER

    # 3 Section Cards
    # Section 1: Foundations
    add_card(slide2, Inches(0.8), Inches(2.1), Inches(3.7), Inches(4.75), "1. Project Foundations")
    tb = slide2.shapes.add_textbox(Inches(1.0), Inches(2.7), Inches(3.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "Topic 01 | Architecture & Scope\n"
        "• Manual paper register flaws & proxy risks.\n"
        "• 4 Core objectives & 3-Tier MERN stack.\n"
        "→ [Slide 03]  Review 1 & 2 Context\n\n"
        "Topic 02 | DB Selection & 6 Collections\n"
        "• Why MongoDB? Flexible BSON & aggregations.\n"
        "• Referencing vs Embedding (16MB limit).\n"
        "• 6 master collections schema design.\n"
        "→ [Slide 04]  Review 1 & 2 Context"
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Section 2: Review 3 Demo & Operations
    add_card(slide2, Inches(4.8), Inches(2.1), Inches(3.7), Inches(4.75), "2. Working Demo & Pipelines")
    tb = slide2.shapes.add_textbox(Inches(5.0), Inches(2.7), Inches(3.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "Topic 03 | Working Demonstration\n"
        "• Role workflows: Admin, Faculty, Student.\n"
        "• Real-time end-to-end operational execution.\n"
        "→ [Slide 05]  Criterion 1 (3 Marks)\n\n"
        "Topic 04 | Full CRUD & Atomic bulkWrite\n"
        "• 5-Entity REST API matrix (Complete CRUD).\n"
        "• bulkWrite() upsert (<12ms) vs naive loops.\n"
        "→ [Slide 06]  Criterion 1 (3 Marks)\n\n"
        "Topic 05 | 7 Aggregation Pipelines\n"
        "• Student/Subject leagues, trends, monthly stats.\n"
        "• Dynamic Defaulter alert pipeline (<75%).\n"
        "→ [Slide 07]  Criterion 2 (2 Marks)"
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Section 3: Review 3 UI, Security & Viva Defense
    add_card(slide2, Inches(8.8), Inches(2.1), Inches(3.7), Inches(4.75), "3. UI, Security & Defense")
    tb = slide2.shapes.add_textbox(Inches(9.0), Inches(2.7), Inches(3.3), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "Topic 06 | UI, Dashboards & Defaulters\n"
        "• 5 KPI cards, Recharts charts, 1-click roll-call.\n"
        "• Dynamic defaulter thresholds & CSV audit export.\n"
        "→ [Slide 08]  Criterion 3 (1.5 Marks)\n\n"
        "Topic 07 | Security & Index Tuning\n"
        "• B-Tree indexing: COLLSCAN vs IXSCAN (<1.2ms).\n"
        "• Bcrypt 10 rounds, stateless JWT RBAC.\n"
        "→ [Slide 09]  Criterion 3 (1.5 Marks)\n\n"
        "Topic 08 | Verification & Viva Defense\n"
        "• 28/28 Automated tests passed (100% pass).\n"
        "• Core technical viva Q&A defense & conclusion.\n"
        "→ [Slide 10]  Criterion 4 (2 Marks)"
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide2, 2)

    # ==========================================
    # SLIDE 3: TOPIC 01 - ARCHITECTURE & OBJECTIVES
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "System Architecture & Core Project Objectives", "Topic 01 | Foundations: Requirements & System Overview", "Review 1 & 2 Context")

    # Left Card: Problem Statement & Motivation
    add_card(slide3, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "Problem Statement & Educational Motivation")
    tb = slide3.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Physical Register Bottlenecks:\n"
        "  Paper registers suffer from physical tear, illegible handwriting, human tally errors, and vulnerability to proxy sign-ins.\n\n"
        "• Administrative Collation Bottleneck:\n"
        "  Faculty spend hours collating daily sheets to compute percentages across 60+ students per batch.\n\n"
        "• Delayed Debarment Warnings:\n"
        "  Students falling below the mandatory 75% attendance threshold are identified at semester end, preventing timely remedial intervention.\n\n"
        "• The Digital Solution:\n"
        "  An atomic web roll-call engine with real-time aggregation recalculation, dynamic threshold alerts, and instant CSV audit exports."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: Core Objectives & Architecture
    add_card(slide3, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "3-Tier System Architecture & Project Scope")
    tb = slide3.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Presentation Layer (Frontend):\n"
        "  - React 19 Single Page Application built with Vite.\n"
        "  - Tailwind CSS responsive design + Lucide icons.\n"
        "  - Recharts dynamic data visuals (Line, Bar, Donut).\n"
        "  - Axios with JWT request bearer token interceptors.\n\n"
        "• Application Layer (Backend):\n"
        "  - Node.js & Express.js REST API service.\n"
        "  - Mongoose ODM schema validation and type modeling.\n"
        "  - Bcrypt salted password hashing + JWT authentication.\n\n"
        "• Database Layer (MongoDB Engine):\n"
        "  - 6 collections with 2,640+ seeded documents.\n"
        "  - B-Tree compound indexing & multi-stage pipeline engine."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide3, 3)

    # ==========================================
    # SLIDE 4: TOPIC 02 - DATABASE SELECTION & 6 COLLECTIONS
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Database Selection (Why MongoDB?) & 6 Collections Schema", "Topic 02 | Foundations: Schema Modeling & Justification", "Review 1 & 2 Context")

    # Left Card: Why MongoDB & ER Decision
    add_card(slide4, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "Why MongoDB? (Architectural Justification)")
    tb = slide4.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Flexible BSON Document Model:\n"
        "   Naturally maps complex university entities (classes, subjects, students) without rigid relational table migrations.\n\n"
        "2. The Referencing vs. Embedding Decision:\n"
        "   • Why NOT embed attendance in Students?\n"
        "     50+ records per student per course causes unbounded document growth toward the 16MB BSON limit and slows demographic lookups.\n"
        "   • Normalized Referencing Solution:\n"
        "     Attendance documents reference Student, Subject, and Class via ObjectIds, enabling fast queries and independent date indexing.\n\n"
        "3. Native Aggregation Engine:\n"
        "   Computes group statistics, dates, and percentages directly in the database engine with low latency.\n\n"
        "4. High-Throughput Bulk Operations:\n"
        "   Atomic bulkWrite API executes full-class roll-call updates in a single network round-trip."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: 6 Collections Summary
    add_card(slide4, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "6 Master Collections Schema Design")
    tb = slide4.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. users: Authentication & Roles\n"
        "   • _id, name, email (Unique Index), password (Bcrypt), role ('admin'|'faculty'|'student').\n\n"
        "2. students: Master Demographic Registry\n"
        "   • _id, regNo (Unique Index), name, email, department, year, semester, section ('D1'|'D2').\n\n"
        "3. faculty: Instructor Registry\n"
        "   • _id, facultyId (Unique Index), name, email, department.\n\n"
        "4. subjects: Course Catalog\n"
        "   • _id, subjectCode (Unique), subjectName, facultyId -> Faculty, semester, credits.\n\n"
        "5. classes: Timetable Classroom Sessions\n"
        "   • _id, subjectId -> Subject, facultyId -> Faculty, date, room, startTime, endTime.\n\n"
        "6. attendances: Attendance Transactions (2,640+ Docs)\n"
        "   • _id, classId, studentId, subjectId, date, status ('Present'|'Absent'), markedBy -> User."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide4, 4)

    # ==========================================
    # SLIDE 5: TOPIC 03 - WORKING DEMONSTRATION WORKFLOWS
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Complete Working Demonstration & Role-Based Workflows", "Topic 03 | Review 3 Criterion 1: Complete Working Demonstration", "Criterion 1: 3 Marks")

    # Left Card: Live Role Workflows
    add_card(slide5, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "Live Operational Demonstration (3 Roles)")
    tb = slide5.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Administrator Demonstration Workflow:\n"
        "   • Master entity management: Full CRUD on students, faculty, subjects, and timetable classes.\n"
        "   • Referential cascading integrity: Deleting a student automatically cleans up linked attendance records.\n"
        "   • Real-time system monitoring & pipeline code inspector.\n\n"
        "2. Faculty Member Demonstration Workflow:\n"
        "   • High-speed digital roll-call: Select course and date to load student roster.\n"
        "   • Batch actions: 1-Click 'Mark All Present' / 'Mark All Absent' with individual toggle switches.\n"
        "   • Live session turnout gauge recalculates live before submission.\n\n"
        "3. Student Demonstration Workflow:\n"
        "   • Self-service personal portal: View overall and subject-by-subject percentage breakdowns.\n"
        "   • Real-time debarment warning banner if attendance falls below 75%."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: End-to-End Pipeline
    add_card(slide5, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "End-to-End Execution Dataflow")
    tb = slide5.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Step 1: User Authentication & JWT Issuance\n"
        "  User submits email/password $\\rightarrow$ bcrypt validates salted hash $\\rightarrow$ signed JWT token returned and stored in localStorage.\n\n"
        "• Step 2: Roll-Call Submission\n"
        "  Faculty toggles student statuses on React UI $\\rightarrow$ frontend bundles all 60 records into a single JSON payload $\\rightarrow$ Axios attaches x-auth-token.\n\n"
        "• Step 3: Express Route & RBAC Middleware\n"
        "  JWT middleware verifies token signature and faculty/admin role $\\rightarrow$ passes clean array to attendance controller.\n\n"
        "• Step 4: Atomic Database Upsert Engine\n"
        "  MongoDB executes bulkWrite() upsert in <12ms $\\rightarrow$ updates records idempotently with zero duplicate creation.\n\n"
        "• Step 5: Real-Time Analytics Recalculation\n"
        "  Dashboard aggregation pipelines re-compute attendance percentages instantly upon next request."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide5, 5)

    # ==========================================
    # SLIDE 6: TOPIC 04 - CRUD MATRIX & ATOMIC BULKWRITE
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Full CRUD Operations Matrix & Atomic bulkWrite() Engine", "Topic 04 | Review 3 Criterion 1: Core Operations & Data Integrity", "Criterion 1: 3 Marks")

    # Top Table: REST API Matrix
    table_shape = slide6.shapes.add_table(6, 5, Inches(0.8), Inches(1.55), Inches(11.733), Inches(2.3))
    table = table_shape.table
    table.columns[0].width = Inches(1.6)
    table.columns[1].width = Inches(2.4)
    table.columns[2].width = Inches(2.8)
    table.columns[3].width = Inches(2.4)
    table.columns[4].width = Inches(2.533)

    crud_data = [
        ["Resource Entity", "CREATE (POST)", "READ (GET)", "UPDATE (PUT)", "DELETE (DELETE)"],
        ["Students", "POST /api/students", "GET /api/students?search&page", "PUT /api/students/:id", "DELETE /api/students/:id (Cascade)"],
        ["Faculty", "POST /api/faculty", "GET /api/faculty", "PUT /api/faculty/:id", "DELETE /api/faculty/:id"],
        ["Subjects", "POST /api/subjects", "GET /api/subjects (Populated)", "PUT /api/subjects/:id", "DELETE /api/subjects/:id"],
        ["Classes", "POST /api/classes", "GET /api/classes (Populated)", "PUT /api/classes/:id", "DELETE /api/classes/:id"],
        ["Attendance", "POST /api/attendance (Bulk)", "GET /api/attendance?date&subj", "PUT /api/attendance/:id (Toggle)", "DELETE /api/attendance/:id"],
    ]

    for row_idx, row in enumerate(crud_data):
        for col_idx, cell_value in enumerate(row):
            cell = table.cell(row_idx, col_idx)
            cell.text = cell_value
            p = cell.text_frame.paragraphs[0]
            if row_idx == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_NAVY
                p.font.bold = True
                p.font.size = Pt(10)
                p.font.color.rgb = C_WHITE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if row_idx % 2 == 0 else C_WHITE
                p.font.size = Pt(9.5)
                p.font.color.rgb = C_TEXT_MAIN
                if col_idx == 0:
                    p.font.bold = True
                    p.font.color.rgb = C_BLUE

    # Bottom Left Card: Problem - Naive Loop
    add_card(slide6, Inches(0.8), Inches(4.05), Inches(5.6), Inches(2.85), "The Problem: Naive Iterative Saves Anti-Pattern")
    tb = slide6.shapes.add_textbox(Inches(1.05), Inches(4.55), Inches(5.1), Inches(2.25))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Sequential Insertion Anti-Pattern:\n"
        "  for (let r of records) { await Attendance.create(r); }\n\n"
        "• Drawbacks for a class of 60 students:\n"
        "  - 60 sequential HTTP/TCP round-trips to MongoDB.\n"
        "  - Total latency: 1,500ms+ per roll-call session.\n"
        "  - Partial failure risk: If record #30 drops due to network glitch, database is left in a corrupted state."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Bottom Right Card: Solution - bulkWrite
    add_card(slide6, Inches(6.8), Inches(4.05), Inches(5.7), Inches(2.85), "The Solution: Atomic bulkWrite() Upsert Engine")
    tb = slide6.shapes.add_textbox(Inches(7.05), Inches(4.55), Inches(5.2), Inches(2.25))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Engineered Atomic Solution:\n"
        "  Attendance.bulkWrite(records.map(r => ({\n"
        "    updateOne: { filter: { studentId: r.studentId, subjectId: r.subjectId, date: r.date },\n"
        "                 update: { $set: { status: r.status, markedBy: req.user.id } }, upsert: true }\n"
        "  })));\n"
        "• Completed in under 12ms (>99% latency reduction!).\n"
        "• Single batch payload: Atomic, crash-safe, and idempotent."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(10.5)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide6, 6)

    # ==========================================
    # SLIDE 7: TOPIC 05 - 7 AGGREGATION PIPELINES
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Advanced Aggregation Framework: 7 Multi-Stage Pipelines", "Topic 05 | Review 3 Criterion 2: Advanced Queries & Analytics", "Criterion 2: 2 Marks")

    # 3 Columns for 7 Pipelines (Rubrics require min 5, we have 7)
    # Col 1: Student & Subject
    add_card(slide7, Inches(0.8), Inches(1.55), Inches(3.7), Inches(5.2), "1. Student & Subject Analytics")
    tb = slide7.shapes.add_textbox(Inches(1.0), Inches(2.15), Inches(3.3), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Pipeline 1: Student Attendance %\n"
        "  - $group by studentId: sum totalClasses and presentClasses ($cond: status == 'Present').\n"
        "  - $project: percentage = (present / total) * 100.\n"
        "  - $lookup: join student demographics.\n"
        "  - $sort: order descending by percentage.\n"
        "  - Powers full student league rankings.\n\n"
        "• Pipeline 2: Subject-Wise Turnout\n"
        "  - $group by subjectId.\n"
        "  - $project: calculate turnout rate.\n"
        "  - $lookup: fetch course name and code.\n"
        "  - $sort: highest attendance first.\n"
        "  - Powers Subject Bar Chart on Dashboard."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Col 2: Time-Series & Defaulters
    add_card(slide7, Inches(4.8), Inches(1.55), Inches(3.7), Inches(5.2), "2. Trends & Defaulter Tracker")
    tb = slide7.shapes.add_textbox(Inches(5.0), Inches(2.15), Inches(3.3), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Pipeline 3: Daily Attendance Trends\n"
        "  - $group by $dateToString('%Y-%m-%d').\n"
        "  - Sum totalPresent and totalAbsent.\n"
        "  - $project: daily percentage turnout.\n"
        "  - $sort: date ascending (+1).\n"
        "  - Powers Daily Trend Line Chart.\n\n"
        "• Pipeline 4: Defaulters (<75% Alert)\n"
        "  - $group: aggregate attendance per student.\n"
        "  - $project: compute exact percentage.\n"
        "  - $match: filter percentage < threshold.\n"
        "  - $lookup: attach student details.\n"
        "  - Dynamic threshold parameter (?threshold=75).\n"
        "  - Drives Dean's debarment notice list."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Col 3: Cohort & Summary
    add_card(slide7, Inches(8.8), Inches(1.55), Inches(3.7), Inches(5.2), "3. Cohort & Institutional Stats")
    tb = slide7.shapes.add_textbox(Inches(9.0), Inches(2.15), Inches(3.3), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "• Pipeline 5: Monthly Report\n"
        "  - Date math operators: $year and $month.\n"
        "  - Buckets 2,640+ logs into monthly sets.\n"
        "  - Computes monthly turnout averages.\n"
        "  - Powers Dean's academic reviews.\n\n"
        "• Pipeline 6: Section Comparison\n"
        "  - $lookup students & $group on section.\n"
        "  - Live Result: Section D1 (86.5%) vs Section D2 (73.0%).\n"
        "  - Identifies struggling class sections.\n\n"
        "• Pipeline 7: Overall Summary\n"
        "  - $group with _id: null.\n"
        "  - Counts total logs, classes, and turnout rate (80%) in 1 collection scan."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide7, 7)

    # ==========================================
    # SLIDE 8: TOPIC 06 - FRONTEND UI & USABILITY
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Frontend User Interface, Dashboards & Defaulter Tracking", "Topic 06 | Review 3 Criterion 3: User Interface and Usability", "Criterion 3: 1.5 Marks")

    # Left Card: Dashboard & Visuals
    add_card(slide8, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "Executive Analytics Dashboard & Data Visualizations")
    tb = slide8.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Executive Analytics Dashboard:\n"
        "   • 5 Real-Time KPI Metric Cards: Total Students, Faculty, Courses, Attendance Turnout %, and Defaulter Count.\n"
        "   • Interactive Recharts Data Visualizations:\n"
        "     - Line Chart: 25-day daily attendance trend curve.\n"
        "     - Donut Chart: Present vs Absent ratio distribution.\n"
        "     - Bar Chart: Subject-wise attendance performance.\n\n"
        "2. High-Speed Attendance Roll-Call Engine:\n"
        "   • Subject and Date selectors with automatic student roster loading.\n"
        "   • 'Mark All Present' / 'Mark All Absent' 1-click batch actions.\n"
        "   • Individual toggle switch buttons with live session turnout gauge.\n\n"
        "3. Live Aggregation Pipeline Inspector:\n"
        "   • Interactive evaluator tool displaying native MongoDB pipeline code and raw JSON outputs side-by-side."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: Defaulters & Usability
    add_card(slide8, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "Defaulter Tracking, CSV Audit Export & Usability")
    tb = slide8.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Interactive Defaulter Tracker:\n"
        "   • Real-time identification of students falling below mandatory attendance.\n"
        "   • Interactive dynamic threshold filter buttons:\n"
        "     - 65% (Critical Debarment Alert)\n"
        "     - 75% (Mandatory University Examination Threshold)\n"
        "     - 80% (Advisory Notice)\n"
        "     - 85% (Good Standing Benchmark)\n\n"
        "2. 1-Click CSV Audit Export:\n"
        "   • Instant client-side download of formatted CSV files ready for dispatch to parents or the Dean's office.\n\n"
        "3. Usability, Responsiveness & Accessibility:\n"
        "   • Tailored dark-mode UI with high-contrast typography (Inter & JetBrains Mono).\n"
        "   • Responsive layout across Desktop, Tablet, and Mobile viewports.\n"
        "   • 1-Click pre-filled credential buttons on login page for instant assessment."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide8, 8)

    # ==========================================
    # SLIDE 9: TOPIC 07 - SECURITY & B-TREE INDEXING
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Security Architecture, B-Tree Indexing & Query Tuning", "Topic 07 | Review 3 Criterion 3 (Contd.): Security & Performance", "Criterion 3: 1.5 Marks")

    # Left Card: Indexing Strategy & Benchmark
    add_card(slide9, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "B-Tree Indexing Strategy & Execution Benchmark (<1.2ms)")
    tb = slide9.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Implemented B-Tree Indexes:\n"
        "   • Unique Single-Field: students.regNo, users.email, subjects.subjectCode, faculty.facultyId.\n"
        "   • Compound Unique Index: Attendance { studentId: 1, subjectId: 1, date: 1 }.\n"
        "     - Prevents duplicate attendance logs for same student/course/date.\n"
        "     - Serves as the primary filter key for atomic bulkWrite upserts.\n"
        "   • Time-Series & Secondary: attendance { date: 1 } & { subjectId: 1, date: 1 }.\n"
        "   • Cohort Filter Index: students { department: 1, section: 1 }.\n\n"
        "2. Performance Benchmark on 2,640+ Attendance Records:\n"
        "   • Without Index (COLLSCAN): docsExamined = 2,640, executionTime = ~28.4ms.\n"
        "   • With Compound Index (IXSCAN): docsExamined = 1, executionTime = < 1.2ms (Over 23x performance speedup!).\n"
        "   • explain('executionStats') -> stage: 'IXSCAN', indexName: 'studentId_1_subjectId_1_date_1'"
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: Security Architecture
    add_card(slide9, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "Security Architecture & Document Validation")
    tb = slide9.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "1. Bcrypt Password Hashing:\n"
        "   Passwords encrypted with 10 salt rounds prior to storage. Plaintext passwords never touch database or server logs.\n\n"
        "2. Stateless JSON Web Tokens (JWT):\n"
        "   Digitally signed tokens containing user claims (id, role, expiry) returned on login and validated in x-auth-token header.\n\n"
        "3. Role-Based Access Control (RBAC):\n"
        "   • Admin: Full CRUD access across students, faculty, subjects, classes.\n"
        "   • Faculty: Mark attendance, view course analytics, inspect defaulters.\n"
        "   • Student: View personal attendance records and subject percentages.\n\n"
        "4. NoSQL Injection Prevention & Data Validation:\n"
        "   Strict Mongoose schema typing and Express JSON body parser prevent operator injection attacks ($gt, $ne, $where).\n\n"
        "5. Referential Integrity & Validation:\n"
        "   Required field constraints, enum validations ('Present'|'Absent'), and ObjectId reference integrity."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide9, 9)

    # ==========================================
    # SLIDE 10: TOPIC 08 - VERIFICATION & VIVA VOCE DEFENSE
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Automated Verification, Viva Voce Defense & Conclusion", "Topic 08 | Review 3 Criterion 4: Technical Defense & Viva Voce", "Criterion 4: 2 Marks")

    # Left Card: Automated Test Suite
    add_card(slide10, Inches(0.8), Inches(1.55), Inches(5.6), Inches(5.2), "Automated Test Suite (28 Passed, 0 Failed)")
    tb = slide10.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "Automated Test Execution (node test_api.js):\n\n"
        "• Module 1: Auth & JWT Issuance  [PASS]\n"
        "  - Admin/Faculty login validated; invalid password rejected.\n"
        "• Module 2: Students CRUD & Cascade Cleanup  [PASS]\n"
        "  - Full CRUD verified; deleting student cascades to attendance.\n"
        "• Module 3: Faculty & Subjects CRUD  [PASS]\n"
        "  - Unique facultyId enforced; Mongoose population verified.\n"
        "• Module 4: Classes & Timetable CRUD  [PASS]\n"
        "  - Schedule created with room numbers and timings.\n"
        "• Module 5: Attendance Atomic Operations  [PASS]\n"
        "  - bulkWrite() batch upserts and status toggles validated.\n"
        "• Module 6: 7 Native Aggregations Executed  [PASS]\n"
        "  - Summary, Student %, Subject %, Daily stats, Defaulters (<75%), Monthly reports, Section stats (D1 vs D2).\n\n"
        "Result: 28 of 28 Automated Tests Passed (100% Pass Rate)."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    # Right Card: Viva Voce Defense & Conclusion
    add_card(slide10, Inches(6.8), Inches(1.55), Inches(5.7), Inches(5.2), "Viva Voce Defense & Review 3 Conclusion")
    tb = slide10.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    tf.text = (
        "Key Viva Voce Technical Defense Q&A:\n\n"
        "Q1: Why choose MongoDB over Relational SQL for attendance?\n"
        "Ans: Scalability to millions of records, native multi-stage aggregations without expensive JOINs, and high-throughput atomic bulk writes.\n\n"
        "Q2: Why reference instead of embed attendance in Students?\n"
        "Ans: Avoids the 16MB document size limit, eliminates document bloat, and enables independent indexing on dates and subjects.\n\n"
        "Q3: What makes your bulkWrite operation idempotent?\n"
        "Ans: The unique compound index { studentId, subjectId, date } ensures upsert updates existing records instead of generating duplicates.\n\n"
        "Review 3 Evaluation Summary:\n"
        "Fully realized, production-ready full-stack application exceeding all BCSE302P Review 3 criteria: 6 collections (min 5), 2,640+ documents (min 100), 7 aggregations (min 5), compound indexing (<1.2ms), and 100% test pass rate."
    )
    for p in tf.paragraphs:
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_MAIN

    add_footer(slide10, 10)

    # Save presentation
    output_path = "c:\\DBS\\Student_Attendance_Management_System_BCSE302P.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created with {TOTAL_SLIDES} slides at: {output_path}")

if __name__ == "__main__":
    create_presentation()
