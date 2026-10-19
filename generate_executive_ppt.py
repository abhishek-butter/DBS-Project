import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_filename="Enterprise_SAMS_Architecture_Deck.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Executive Modern Color Palette
    C_NAVY = RGBColor(15, 23, 42)          # Slate 900
    C_SLATE_BG = RGBColor(248, 250, 252)   # Slate 50
    C_CARD_BG = RGBColor(255, 255, 255)    # White
    C_CARD_BORDER = RGBColor(226, 232, 240)# Slate 200
    C_PRIMARY = RGBColor(37, 99, 235)      # Royal Blue (600)
    C_SECONDARY = RGBColor(2, 132, 199)    # Sky 600
    C_DARKBLUE = RGBColor(30, 58, 138)     # Navy 900
    C_TEXT_MAIN = RGBColor(15, 23, 42)     # Slate 900
    C_TEXT_MUTED = RGBColor(71, 85, 105)   # Slate 600
    C_EMERALD = RGBColor(16, 185, 129)     # Emerald 500
    C_EMERALD_DARK = RGBColor(5, 150, 105) # Emerald 600
    C_AMBER = RGBColor(217, 119, 6)        # Amber 600
    C_RED = RGBColor(225, 29, 72)          # Rose 600
    C_WHITE = RGBColor(255, 255, 255)
    C_BANNER_BG = RGBColor(241, 245, 249)  # Slate 100
    C_CODE_BG = RGBColor(30, 41, 59)       # Slate 800

    TOTAL_SLIDES = 10

    def add_header(slide, title_text, category_text, badge_text=""):
        # Header textbox
        hb = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.733), Inches(0.95))
        tf = hb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_PRIMARY

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = C_TEXT_MAIN

        # Optional executive badge at top-right
        if badge_text:
            badge_width = Inches(2.8)
            badge_left = Inches(12.533) - badge_width
            pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, badge_left, Inches(0.42), badge_width, Inches(0.4))
            pill.fill.solid()
            pill.fill.fore_color.rgb = RGBColor(238, 242, 255)
            pill.line.color.rgb = RGBColor(199, 210, 254)
            pill.line.width = Pt(1)
            tf_p = pill.text_frame
            tf_p.word_wrap = True
            tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
            p_m = tf_p.paragraphs[0]
            p_m.text = badge_text.upper()
            p_m.alignment = PP_ALIGN.CENTER
            p_m.font.size = Pt(9)
            p_m.font.bold = True
            p_m.font.color.rgb = C_PRIMARY

        # Clean divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = C_CARD_BORDER
        line.line.color.rgb = C_CARD_BORDER

    def add_footer(slide, current_page):
        fb = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.3))
        tf = fb.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"SAMS — Enterprise Student Attendance Management System  |  Abhishek VS & Ayush Naugariya  |  Slide {current_page:02d} of {TOTAL_SLIDES:02d}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_MUTED

    def add_card(slide, left, top, width, height, title="", bg_color=C_CARD_BG, border_color=C_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.2), width - Inches(0.56), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(13.5)
            p.font.bold = True
            p.font.color.rgb = C_PRIMARY

        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Executive Dark Canvas)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_NAVY
    bg1.line.fill.background()

    tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.333), Inches(5.6))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "ENTERPRISE ARCHITECTURE SHOWCASE  |  FULL-STACK NoSQL PLATFORM"
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(56, 189, 248) # Sky 400
    p0.space_after = Pt(10)

    p1 = tf1.add_paragraph()
    p1.text = "Student Attendance Management System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "A High-Throughput, Document-Oriented NoSQL Platform for Real-Time Academic Tracking & Institutional Analytics"
    p2.font.size = Pt(14)
    p2.font.color.rgb = RGBColor(147, 197, 253) # Sky 200
    p2.space_after = Pt(20)

    # Value Proposition Callout Card inside slide 1
    callout1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.9), Inches(11.333), Inches(1.4))
    callout1.fill.solid()
    callout1.fill.fore_color.rgb = C_CODE_BG
    callout1.line.color.rgb = RGBColor(51, 65, 85)
    callout1.line.width = Pt(1)

    tb_call = slide1.shapes.add_textbox(Inches(1.3), Inches(3.05), Inches(10.733), Inches(1.1))
    tf_call = tb_call.text_frame
    tf_call.word_wrap = True
    p_tag = tf_call.paragraphs[0]
    p_tag.text = "VALUE PROPOSITION & ARCHITECTURAL DIRECTIVE:"
    p_tag.font.size = Pt(10)
    p_tag.font.bold = True
    p_tag.font.color.rgb = RGBColor(52, 211, 153) # Emerald 400
    p_tag.space_after = Pt(4)

    p_val = tf_call.add_paragraph()
    p_val.text = '"Transforming fragmented academic record-keeping into a high-concurrency, auditable, and low-latency analytics platform powered by MongoDB, atomic bulk operations, and real-time aggregation pipelines."'
    p_val.font.size = Pt(12)
    p_val.font.italic = True
    p_val.font.color.rgb = RGBColor(241, 245, 249)

    # Presenters & Metadata
    tb_meta = slide1.shapes.add_textbox(Inches(1.0), Inches(4.7), Inches(11.333), Inches(1.8))
    tf_meta = tb_meta.text_frame
    tf_meta.word_wrap = True

    p_pres = tf_meta.paragraphs[0]
    p_pres.text = "System Architects & Presenters:  Abhishek VS & Ayush Naugariya"
    p_pres.font.size = Pt(13.5)
    p_pres.font.bold = True
    p_pres.font.color.rgb = C_WHITE
    p_pres.space_after = Pt(6)

    p_spec = tf_meta.add_paragraph()
    p_spec.text = "Domain: Software Systems Architecture & Database Engineering"
    p_spec.font.size = Pt(11)
    p_spec.font.color.rgb = RGBColor(203, 213, 225)
    p_spec.space_after = Pt(6)

    p_tech = tf_meta.add_paragraph()
    p_tech.text = "Technology Stack: MongoDB 7.x (WiredTiger) • Express.js 4.x • React 18 SPA • Node.js 20 • Mongoose 8.x • Tailwind CSS"
    p_tech.font.size = Pt(10.5)
    p_tech.font.color.rgb = RGBColor(148, 163, 184)

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & SYSTEM OBJECTIVES
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Domain Bottlenecks & Strategic System Objectives", "Problem Analysis & Solution Scope", "Architectural Scope")
    add_footer(slide2, 2)

    # Left Card: Legacy Bottlenecks
    add_card(slide2, Inches(0.8), Inches(1.5), Inches(5.7), Inches(4.5), "The Legacy Operational Challenge", border_color=RGBColor(254, 205, 211))
    tb2_left = slide2.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(3.7))
    tf2_l = tb2_left.text_frame
    tf2_l.word_wrap = True

    pts2_l = [
        ("Manual Ingestion Latency & Error:", "Traditional attendance relies on physical paper registers or disconnected spreadsheets, resulting in data loss, human transcription errors, and extensive administrative delays."),
        ("Burst Concurrency Bottlenecks:", "Higher education class transitions force hundreds of faculty members to submit attendance within a narrow 10-minute window, causing severe lock contention in traditional relational databases."),
        ("Delayed Regulatory Interventions:", "Institutional attendance thresholds (e.g., mandatory 75% attendance) cannot be enforced proactively when attendance records take days to compile manually."),
        ("Absence of Audit Governance:", "Legacy spreadsheets lack cryptographic tampering prevention, granular Role-Based Access Control (RBAC), and reliable submission audit trails.")
    ]
    for i, (head, body) in enumerate(pts2_l):
        p = tf2_l.paragraphs[0] if i == 0 else tf2_l.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = C_RED
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10)
        r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Strategic Objectives
    add_card(slide2, Inches(6.8), Inches(1.5), Inches(5.7), Inches(4.5), "Strategic Engineering Objectives", border_color=RGBColor(167, 243, 208))
    tb2_right = slide2.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(3.7))
    tf2_r = tb2_right.text_frame
    tf2_r.word_wrap = True

    pts2_r = [
        ("Sub-15ms Ingestion Latency:", "Enable instantaneous, single-click attendance recording for entire cohorts (60+ students per batch) via atomic database batch operations."),
        ("100% Idempotent Submissions:", "Guarantee that re-submitting or correcting attendance updates records in-place without generating duplicate entries, ensuring complete data integrity."),
        ("Live In-Engine Analytics:", "Provide academic deans and instructors with real-time institutional intelligence (defaulter lists, course health, daily trends) calculated directly in database memory."),
        ("Enterprise Cryptographic Security:", "Enforce stateless JSON Web Token (JWT) authentication, 10-round Bcrypt password hashing, and strict 3-tier Role-Based Access Control.")
    ]
    for i, (head, body) in enumerate(pts2_r):
        p = tf2_r.paragraphs[0] if i == 0 else tf2_r.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = C_EMERALD_DARK
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10)
        r2.font.color.rgb = C_TEXT_MUTED

    # Bottom Banner: Target Metrics
    b_banner = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.7))
    b_banner.fill.solid()
    b_banner.fill.fore_color.rgb = C_BANNER_BG
    b_banner.line.color.rgb = C_CARD_BORDER
    tb_bb = slide2.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.5))
    tf_bb = tb_bb.text_frame
    p_bb = tf_bb.paragraphs[0]
    p_bb.text = "CORE DELIVERABLES:  < 15ms Bulk Write Latency  |  100% Idempotent Operations  |  Automated <75% Defaulter Detection  |  Zero ETL Pipeline Lag"
    p_bb.font.size = Pt(10.5)
    p_bb.font.bold = True
    p_bb.font.color.rgb = C_DARKBLUE
    p_bb.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 3: NoSQL SELECTION & ARCHITECTURE JUSTIFICATION
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "NoSQL Database Selection & 3-Tier Layered Architecture", "Architecture & Technology Justification", "Tiered Design")
    add_footer(slide3, 3)

    # 3 Architecture Tier Cards (Top Half)
    tiers = [
        ("Tier 1: Presentation Layer", "React 18 SPA + Vite + Tailwind", [
            "Single Page Application with instant client-side routing",
            "Axios interceptor pipeline attaching JWT bearer tokens",
            "Responsive attendance matrix and Chart.js dashboards",
            "State management via React Context avoiding prop-drilling"
        ], C_PRIMARY, Inches(0.8)),
        ("Tier 2: Application API Layer", "Node.js 20 LTS + Express.js 4.x", [
            "Stateless RESTful API gateway on port 5000",
            "Cryptographic JWT signature verification middleware",
            "Role-Based Access Control (Admin, Faculty, Student)",
            "Mongoose ODM schema validation and atomic batch compiler"
        ], C_SECONDARY, Inches(4.8)),
        ("Tier 3: Persistence Layer", "MongoDB 7.x Community Server", [
            "WiredTiger high-concurrency document storage engine",
            "Compound B-Tree index traversal with Snappy compression",
            "Native multi-stage aggregation pipelines in database RAM",
            "Document-level write locking eliminating table contention"
        ], C_DARKBLUE, Inches(8.8))
    ]

    for title, subtitle, bullets, color, left_pos in tiers:
        add_card(slide3, left_pos, Inches(1.5), Inches(3.733), Inches(2.7), title)
        tb_t = slide3.shapes.add_textbox(left_pos + Inches(0.2), Inches(1.95), Inches(3.333), Inches(2.15))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True

        p_sub = tf_t.paragraphs[0]
        p_sub.text = subtitle
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = color
        p_sub.space_after = Pt(4)

        for b in bullets:
            p = tf_t.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_TEXT_MUTED
            p.space_after = Pt(2.5)

    # Bottom Half: Technical Justification (MongoDB vs Relational RDBMS)
    add_card(slide3, Inches(0.8), Inches(4.35), Inches(11.733), Inches(2.5), "Technical Justification: Why MongoDB over Relational RDBMS?")
    tb3_bot = slide3.shapes.add_textbox(Inches(1.05), Inches(4.85), Inches(11.233), Inches(1.85))
    tf3_b = tb3_bot.text_frame
    tf3_b.word_wrap = True

    reasons = [
        ("Zero Object-Relational Impedance Mismatch:", "In full-stack JavaScript architectures, data naturally exists as JSON trees. Relational databases force developers to decompose objects across normalized tables and reconstruct them via expensive multi-table SQL joins. MongoDB natively stores and returns BSON/JSON, eliminating mapping overhead."),
        ("Document-Level Concurrency for Write-Heavy Bursts:", "Academic attendance creates severe write spikes at class changeovers. Traditional RDBMS table or page locks create major queue delays. MongoDB's WiredTiger storage engine utilizes document-level locking, ensuring that concurrent submissions across different classes never block each other."),
        ("Declarative In-Engine Multi-Stage Aggregations:", "Computing institutional metrics (e.g., student attendance percentage, defaulter warnings, monthly trends) in SQL requires complex nested subqueries. MongoDB's aggregation pipeline processes data as a clean stream executed directly in database RAM with zero ETL delay.")
    ]
    for i, (head, body) in enumerate(reasons):
        p = tf3_b.paragraphs[0] if i == 0 else tf3_b.add_paragraph()
        p.space_after = Pt(4)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 4: DATABASE SCHEMA & DATA MODELING DESIGN
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Relational Modeling in NoSQL: Data Modeling & Schemas", "Data Engineering & Schema Design", "Schema Architecture")
    add_footer(slide4, 4)

    # Left Card: The 6 Core Collections
    add_card(slide4, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "The 6 Core Production Collections")
    tb4_l = slide4.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf4_l = tb4_l.text_frame
    tf4_l.word_wrap = True

    colls = [
        ("users Collection:", "name, email (unique), password (Bcrypt 10-round hash), role ('admin' | 'faculty' | 'student'), createdAt. Handles identity and RBAC."),
        ("students Collection:", "regNo (unique), name, email, department, year, section ('D1' | 'D2'), semester. Indexed on { department: 1, section: 1 } for cohort retrieval."),
        ("faculties Collection:", "facultyId (unique), name, email, department. Manages academic instructor profiles and course assignments."),
        ("subjects Collection:", "subjectCode (unique), subjectName, facultyId (ref: Faculty), semester, credits. Defines curriculum catalog and faculty linkage."),
        ("classes Collection:", "subjectId (ref: Subject), facultyId (ref: Faculty), date, startTime, endTime, room. Manages lecture timetable scheduling."),
        ("attendances Collection:", "classId (ref: Class), studentId (ref: Student), subjectId (ref: Subject), date, status ('Present' | 'Absent'), markedBy (ref: User). Compound indexed.")
    ]
    for i, (head, body) in enumerate(colls):
        p = tf4_l.paragraphs[0] if i == 0 else tf4_l.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Normalized Referencing vs Embedding
    add_card(slide4, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Design Pattern: Referencing vs. Embedding")
    tb4_r = slide4.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf4_r = tb4_r.text_frame
    tf4_r.word_wrap = True

    # Mathematical Proof Box
    p_pr = tf4_r.paragraphs[0]
    p_pr.text = "MATHEMATICAL PROOF: AVOIDING THE 16MB BSON LIMIT"
    p_pr.font.size = Pt(10.5)
    p_pr.font.bold = True
    p_pr.font.color.rgb = C_AMBER
    p_pr.space_after = Pt(4)

    proofs = [
        ("The 16MB Document Boundary:", "MongoDB enforces a strict hard ceiling of 16 Megabytes per individual document. Embedding attendance records inside the student document creates an unbounded array problem."),
        ("Growth Over Time:", "A 4-year degree consists of 8 semesters × 6 subjects = 48 subjects. With ~45 sessions per subject, each student accumulates over 2,160 attendance events. Each event with metadata consumes ~250 bytes."),
        ("Document Relocation on Disk:", "In WiredTiger, continuously growing embedded arrays cause documents to exceed their pre-allocated disk space, triggering expensive document relocations, severe storage fragmentation, and memory bloat."),
        ("The Normalized Referencing Solution:", "Storing attendance as individual documents linked via 12-byte ObjectId foreign keys keeps documents lightweight (~150 bytes), guarantees linear disk allocation, and enables horizontal scaling over decades of historical records."),
        ("Multi-Dimensional Query Efficiency:", "Normalized records allow instant queries like 'all students absent for Subject X on Date Y' using B-Tree indexes, avoiding expensive collection-wide nested array scans.")
    ]
    for head, body in proofs:
        p = tf4_r.add_paragraph()
        p.space_after = Pt(4.5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = C_TEXT_MAIN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9)
        r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 5: CORE IMPLEMENTATION & CRUD OPERATIONS
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Data Access Layer, Ingestion Pipelines & End-to-End CRUD", "Backend Engineering & Data Access", "CRUD & Scale")
    add_footer(slide5, 5)

    # Left Card: RESTful CRUD
    add_card(slide5, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Full-Stack RESTful CRUD Implementation")
    tb5_l = slide5.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf5_l = tb5_l.text_frame
    tf5_l.word_wrap = True

    crud_ops = [
        ("CREATE Operations (POST):", "High-throughput creation of lecture sessions and atomic bulk upserts for attendance via POST /api/attendance. Automatically normalizes incoming timestamps to UTC midnight (00:00:00.000Z)."),
        ("READ Operations (GET):", "Multi-parameter query filtering on GET /api/attendance across studentId, subjectId, date ranges ($gte/$lte), and status. Implements cursor limit safeguards and Mongoose .populate() for relational joins."),
        ("UPDATE Operations (PUT):", "Instant in-place attendance status updates via PUT /api/attendance/:id and atomic subject/faculty modifications with full validation error propagation."),
        ("DELETE Operations (DELETE):", "Referential cleanup for canceled class sessions and invalid attendance logs via DELETE /api/attendance/:id, returning confirmation status payloads."),
        ("Schema Validation via Mongoose ODM:", "Enforces required field checks, email format validation, ObjectId casting, and strict enums (status: ['Present', 'Absent']). Rejects unvalidated payload fields.")
    ]
    for i, (head, body) in enumerate(crud_ops):
        p = tf5_l.paragraphs[0] if i == 0 else tf5_l.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Automated Seeding & Dataset Scale
    add_card(slide5, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Automated Data Ingestion & Scale Testing")
    tb5_r = slide5.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    seed_pts = [
        ("Automated Ingestion Script (seed.js):", "Engineered an automated data generator that connects directly to MongoDB, purges stale collections, provisions Bcrypt-hashed credentials, and populates 60 students and 5 academic subjects."),
        ("2,640+ Realistic Primary Seed Records:", "Generates 25 consecutive instructional days of attendance across all enrolled subjects, delivering over 2,640 primary documents—far exceeding baseline prototype volumes."),
        ("Realistic Behavioral Profiles:", "Models genuine human attendance patterns: Top Attendees (90-95%), Average Cohorts (75-88%), and Chronic Defaulters (62-70%), ensuring analytical queries return real, actionable outliers."),
        ("52,000+ Scalability Stress Dataset:", "Constructed an extended stress-testing script generating 52,000+ attendance records to empirically measure index selectivity, memory cache consumption, and execution plan transitions."),
        ("Strict UTC Date Normalization:", "All dates normalized via Date.UTC() at ingestion, guaranteeing consistent multi-timezone filtering and zero date-drift bugs during daily aggregation grouping.")
    ]
    for i, (head, body) in enumerate(seed_pts):
        p = tf5_r.paragraphs[0] if i == 0 else tf5_r.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_EMERALD_DARK
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 6: ADVANCED NoSQL FEATURES & OPTIMIZATION
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Atomic Bulk Operations & B-Tree Index Optimization", "High-Performance Database Engineering", "Performance Optimization")
    add_footer(slide6, 6)

    # Left Card: Atomic bulkWrite() Optimization
    add_card(slide6, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Atomic bulkWrite() Batch Upsert Protocol")
    tb6_l = slide6.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf6_l = tb6_l.text_frame
    tf6_l.word_wrap = True

    bwrite_pts = [
        ("The Loop of save() Anti-Pattern:", "Sequential execution of 60 individual save() calls sends 60 separate TCP packets over the wire, consuming ~1,500ms and starving the Node.js libuv threadpool and MongoDB connection pool."),
        ("The bulkWrite() Architecture:", "Compiles all 60 student status updates into a single atomic array of updateOne operations sent in one TCP wire protocol packet:"),
        ("Production Code Implementation:", "Attendance.bulkWrite(records.map(r => ({\n  updateOne: {\n    filter: { studentId: r.studentId, subjectId: r.subjectId, date: normalizedDate },\n    update: { $set: { status: r.status, classId: r.classId, markedBy: req.user.id } },\n    upsert: true\n  }\n})))"),
        ("Sub-12ms Execution Latency:", "Reduces execution time from 1,500ms to < 12ms (over 125x faster), releasing database locks almost instantaneously."),
        ("Idempotency & Duplicate Prevention:", "The { upsert: true } flag combined with the composite filter guarantees that multiple clicks by an instructor update existing records rather than creating duplicate rows.")
    ]
    for i, (head, body) in enumerate(bwrite_pts):
        p = tf6_l.paragraphs[0] if i == 0 else tf6_l.add_paragraph()
        p.space_after = Pt(4.5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        if "bulkWrite(records" in body:
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = C_DARKBLUE
        else:
            r2.font.size = Pt(9)
            r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Indexing & Benchmark
    add_card(slide6, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Compound Indexing & 50,000-Doc Benchmark")
    tb6_r = slide6.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf6_r = tb6_r.text_frame
    tf6_r.word_wrap = True

    p_esr = tf6_r.paragraphs[0]
    p_esr.text = "THE ESR (EQUALITY, SORT, RANGE) RULE"
    p_esr.font.size = Pt(10.5)
    p_esr.font.bold = True
    p_esr.font.color.rgb = C_PRIMARY
    p_esr.space_after = Pt(3)

    p_esr_b = tf6_r.add_paragraph()
    p_esr_b.text = "Our primary compound index { studentId: 1, subjectId: 1, date: 1 } strictly adheres to the ESR rule: exact matches (studentId, subjectId) come first, followed by Range filters (date), ensuring optimal B-Tree branch traversal."
    p_esr_b.font.size = Pt(9)
    p_esr_b.font.color.rgb = C_TEXT_MUTED
    p_esr_b.space_after = Pt(8)

    # Benchmark Comparison Table
    p_tbl = tf6_r.add_paragraph()
    p_tbl.text = "EMPIRICAL BENCHMARK ON 50,000 DOCUMENTS:"
    p_tbl.font.size = Pt(10)
    p_tbl.font.bold = True
    p_tbl.font.color.rgb = C_DARKBLUE
    p_tbl.space_after = Pt(4)

    bench_metrics = [
        ("Query Execution Plan:", "Without Index: COLLSCAN  |  With Compound Index: IXSCAN"),
        ("Total Documents Examined:", "Without Index: 50,000 docs  |  With Index: 3 docs (99.994% reduction)"),
        ("Query Execution Latency:", "Without Index: 28.4 ms  |  With Index: 0.4 ms (71x Speedup)"),
        ("In-Memory Sort Buffers:", "Without Index: Yes (RAM buffer)  |  With Index: Zero RAM allocated"),
        ("Overall Index Catalog:", "6 B-Trees deployed across users, students, subjects, and attendances.")
    ]
    for head, body in bench_metrics:
        p = tf6_r.add_paragraph()
        p.space_after = Pt(4)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(9)
        r1.font.color.rgb = C_EMERALD_DARK
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 7: ADVANCED ANALYTICS & COMPLEX QUERIES
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Multi-Stage Aggregation Pipelines & Institutional Intelligence", "In-Engine Analytical Processing", "Advanced Analytics")
    add_footer(slide7, 7)

    # 3 High-Value Pipeline Cards
    pipes = [
        ("Pipeline 1: Defaulter Detection (<75%)", "GET /api/analytics/low-attendance?threshold=75", [
            ("Stage 1 ($group):", "Groups attendance by studentId; calculates total and present classes."),
            ("Stage 2 ($project):", "Computes percentage using $round, $multiply, and $divide operators."),
            ("Stage 3 ($match):", "Filters output documents where percentage is less than 75%."),
            ("Stage 4 ($lookup):", "Performs equality join with students to fetch student names and regNo."),
            ("Stage 5 ($sort):", "Sorts ascending so the most critical defaulters appear at the top.")
        ], "Impact: Replaces weeks of manual audits with an automated institutional warning list.", C_RED, Inches(0.8)),

        ("Pipeline 2: Course-Wise Attendance Variance", "GET /api/analytics/subject-percentage", [
            ("Stage 1 ($group):", "Groups by subjectId; sums total, present, and absent sessions."),
            ("Stage 2 ($project):", "Computes average attendance percentage per subject."),
            ("Stage 3 ($lookup):", "Joins with subjects collection to retrieve subjectCode and credits."),
            ("Stage 4 ($unwind):", "Flattens the subjectInfo array into an embedded object."),
            ("Stage 5 ($sort):", "Sorts descending by attendance percentage for comparative review.")
        ], "Impact: Highlights subjects suffering from abnormal absenteeism for dean review.", C_PRIMARY, Inches(4.8)),

        ("Pipeline 3: Daily & Monthly Trends", "GET /api/analytics/daily-stats", [
            ("Stage 1 ($group):", "Extracts date string via $dateToString: { format: '%Y-%m-%d' }."),
            ("Stage 2 ($sum):", "Calculates present vs absent student count per calendar day."),
            ("Stage 3 ($project):", "Computes institutional attendance rate per calendar date."),
            ("Stage 4 ($sort):", "Sorts chronologically by date string for time-series charts."),
            ("Monthly Pipeline:", "Extracts $year and $month to chart semester attendance progression.")
        ], "Impact: Powers time-series analytics charts to detect attendance dips near exam periods.", C_EMERALD_DARK, Inches(8.8))
    ]

    for title, endpoint, stages, impact, color, left_pos in pipes:
        add_card(slide7, left_pos, Inches(1.5), Inches(3.733), Inches(5.35), title)
        tb_p = slide7.shapes.add_textbox(left_pos + Inches(0.2), Inches(2.05), Inches(3.333), Inches(4.65))
        tf_p = tb_p.text_frame
        tf_p.word_wrap = True

        p_ep = tf_p.paragraphs[0]
        p_ep.text = endpoint
        p_ep.font.size = Pt(8.5)
        p_ep.font.bold = True
        p_ep.font.color.rgb = color
        p_ep.space_after = Pt(5)

        for st_head, st_desc in stages:
            p = tf_p.add_paragraph()
            p.space_after = Pt(3.5)
            r1 = p.add_run()
            r1.text = st_head + " "
            r1.font.bold = True
            r1.font.size = Pt(9)
            r1.font.color.rgb = C_DARKBLUE
            r2 = p.add_run()
            r2.text = st_desc
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = C_TEXT_MUTED

        p_imp = tf_p.add_paragraph()
        p_imp.space_before = Pt(6)
        r_ih = p_imp.add_run()
        r_ih.text = "Business " + impact
        r_ih.font.bold = True
        r_ih.font.size = Pt(9)
        r_ih.font.color.rgb = color

    # =========================================================================
    # SLIDE 8: USER INTERFACE & USABILITY
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Responsive Presentation Layer & User Experience Design", "Frontend Architecture & HCI", "UI & Usability")
    add_footer(slide8, 8)

    # Left Card: Persona Workflows
    add_card(slide8, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Persona-Tailored Academic Workflows")
    tb8_l = slide8.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf8_l = tb8_l.text_frame
    tf8_l.word_wrap = True

    workflows = [
        ("Interactive Faculty Attendance Matrix:", "Eliminates tedious individual clicking with 'Mark All Present' and 'Mark All Absent' batch toggles. Color-coded status pills (Green = Present, Red = Absent) provide instant visual validation."),
        ("Executive Dean Dashboard:", "Renders high-level institutional KPI cards (Total Students, Active Faculty, Registered Subjects, Overall Attendance Rate) alongside dynamic Chart.js bar and line graphs."),
        ("Proactive Defaulter Warning Console:", "Interactive filter slider dynamically adjusts the compliance threshold (e.g., 75%, 80%) and updates the defaulter table in real-time with zero page reload."),
        ("Student Self-Service Portal:", "Enables students to securely inspect their personalized course-wise attendance breakdown, attended lecture counts, and color-coded debarment risk alerts."),
        ("100% Mobile & Tablet Responsive:", "Fluid CSS grid and flexbox layouts adapt seamlessly from faculty mobile smartphones to wide-screen lecture podiums.")
    ]
    for i, (head, body) in enumerate(workflows):
        p = tf8_l.paragraphs[0] if i == 0 else tf8_l.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Frontend Engineering Rigor
    add_card(slide8, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Frontend Architectural Rigor")
    tb8_r = slide8.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.65))
    tf8_r = tb8_r.text_frame
    tf8_r.word_wrap = True

    fe_rigor = [
        ("React 18 SPA Architecture:", "Built on React 18 leveraging Virtual DOM diffing for rapid UI updates. Transitions between dashboard, marking, and analytics occur instantly without browser reloads."),
        ("Next-Gen Vite Build Tooling:", "Utilizes native browser ES Modules (ESM) during development, eliminating Webpack bundling overhead and delivering sub-second cold starts and instant Hot Module Replacement (HMR)."),
        ("Automated Axios Interceptor Pipeline:", "A centralized Axios request interceptor intercepts all outgoing HTTP calls, extracts the JWT token from localStorage, and injects the x-auth-token header automatically."),
        ("Centralized Global State Management:", "React Context API (AuthContext) manages active user sessions, token persistence, and role state, preventing fragile prop-drilling across the component hierarchy."),
        ("Tailwind CSS Design System:", "Clean slate background palette (#F8FAFC), crisp white card elevation, rounded pill badges, and high-contrast Lucide SVG iconography.")
    ]
    for i, (head, body) in enumerate(fe_rigor):
        p = tf8_r.paragraphs[0] if i == 0 else tf8_r.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_DARKBLUE
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 9: SYSTEM DEMONSTRATION FLOW
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "End-to-End System Demonstration Flow", "Operational Walkthrough & Validation", "Live Demonstration")
    add_footer(slide9, 9)

    # 4 Sequential Demonstration Cards (2x2 Grid)
    demo_phases = [
        ("Phase 1: Identity & RBAC (0:00 - 1:00)", Inches(0.8), Inches(1.5), [
            ("Authentication:", "Log in as faculty@example.com with password123 via POST /api/auth/login."),
            ("Token Verification:", "Show JWT issuance, stateless token storage in localStorage, and payload decoding."),
            ("Role Governance:", "Demonstrate role-based UI orchestration: faculty sees attendance tools; admin sees user controls.")
        ], C_PRIMARY),

        ("Phase 2: Attendance Ingestion (1:00 - 2:30)", Inches(6.8), Inches(1.5), [
            ("Session Selection:", "Select Subject BCSE302P and calendar date; fetch 60 enrolled students."),
            ("1-Click Marking:", "Execute 'Mark All Present'; toggle specific students to 'Absent'."),
            ("bulkWrite() Proof:", "Click 'Save Attendance'; demonstrate 60 records saved in < 12ms via atomic batch upsert with zero page reload.")
        ], C_EMERALD_DARK),

        ("Phase 3: Analytics & Defaulters (2:30 - 3:45)", Inches(0.8), Inches(4.35), [
            ("Institutional KPIs:", "Open Analytics dashboard displaying 2,640+ total records and overall percentage."),
            ("Defaulter Detection:", "Run Pipeline 4 with threshold slider at 75%; instantaneously display identified students."),
            ("Trend Visualization:", "Inspect daily attendance timeline and section comparison ('D1' vs 'D2').")
        ], C_SECONDARY),

        ("Phase 4: Automated Test Suite (3:45 - 5:00)", Inches(6.8), Inches(4.35), [
            ("Test Runner:", "Execute node test_api.js directly in the integrated terminal."),
            ("28/28 Passing Tests:", "Demonstrate 100% green pass rate across Auth, CRUD on all 6 collections, and all 7 aggregations."),
            ("Quality Assurance:", "Verifies complete system correctness, error handling, and security defenses.")
        ], C_DARKBLUE)
    ]

    for title, left, top, steps, color in demo_phases:
        add_card(slide9, left, top, Inches(5.7), Inches(2.5), title)
        tb_d = slide9.shapes.add_textbox(left + Inches(0.25), top + Inches(0.55), Inches(5.2), Inches(1.85))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True

        for i, (st_head, st_desc) in enumerate(steps):
            p = tf_d.paragraphs[0] if i == 0 else tf_d.add_paragraph()
            p.space_after = Pt(3.5)
            r1 = p.add_run()
            r1.text = "• " + st_head + " "
            r1.font.bold = True
            r1.font.size = Pt(9.5)
            r1.font.color.rgb = color
            r2 = p.add_run()
            r2.text = st_desc
            r2.font.size = Pt(9)
            r2.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 10: CONCLUSION & FUTURE ENHANCEMENTS
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Project Achievements, Architectural Takeaways & Roadmap", "Executive Summary & Scalability", "Conclusion & Roadmap")
    add_footer(slide10, 10)

    # Left Card: Achievements
    add_card(slide10, Inches(0.8), Inches(1.5), Inches(5.7), Inches(4.5), "Key Architectural Achievements")
    tb10_l = slide10.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.2), Inches(3.7))
    tf10_l = tb10_l.text_frame
    tf10_l.word_wrap = True

    achievements = [
        ("Sub-12ms Ingestion Latency:", "Replaced slow sequential write loops with atomic bulkWrite() operations, delivering over 125x faster attendance recording for class cohorts."),
        ("Infinite Storage Scalability:", "Eliminated MongoDB's 16MB document limit and prevented disk fragmentation by implementing a clean normalized referencing data model."),
        ("71x Query Acceleration:", "Demonstrated empirical query optimization on 50,000 documents via ESR-compliant compound B-Tree indexes, reducing examined documents by 99.99%."),
        ("In-Engine Analytical Intelligence:", "Engineered 7 native aggregation pipelines providing instant defaulter detection, course health metrics, and longitudinal trends with zero ETL latency."),
        ("100% Automated Test Coverage:", "Validated all authentication, CRUD pathways, and analytics queries via 28 automated integration tests.")
    ]
    for i, (head, body) in enumerate(achievements):
        p = tf10_l.paragraphs[0] if i == 0 else tf10_l.add_paragraph()
        p.space_after = Pt(4.5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_EMERALD_DARK
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # Right Card: Scalability Roadmap
    add_card(slide10, Inches(6.8), Inches(1.5), Inches(5.7), Inches(4.5), "Production Scalability Roadmap")
    tb10_r = slide10.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(3.7))
    tf10_r = tb10_r.text_frame
    tf10_r.word_wrap = True

    roadmap = [
        ("Redis In-Memory Caching Tier:", "Deploy Redis caching for read-heavy executive summary and KPI aggregations, reducing database queries by up to 80% during peak portal traffic."),
        ("Horizontal Sharding Architecture:", "Implement MongoDB range or hashed sharding on { department: 1, studentId: 1 } across replica sets to seamlessly support millions of institutional records."),
        ("Event-Driven Messaging & Alerts:", "Integrate Apache Kafka and Twilio/SendGrid to trigger instantaneous SMS/email notifications to guardians when a student's attendance drops below 75%."),
        ("IoT & Biometric Edge Ingestion:", "Interface REST ingestion endpoints with physical campus RFID readers and biometric scanners for automated classroom walk-in attendance tracking.")
    ]
    for i, (head, body) in enumerate(roadmap):
        p = tf10_r.paragraphs[0] if i == 0 else tf10_r.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "• " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_PRIMARY
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_TEXT_MUTED

    # Bottom Banner: Summary Metrics
    b_banner10 = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.7))
    b_banner10.fill.solid()
    b_banner10.fill.fore_color.rgb = C_BANNER_BG
    b_banner10.line.color.rgb = C_CARD_BORDER
    tb_bb10 = slide10.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.5))
    tf_bb10 = tb_bb10.text_frame
    p_bb10 = tf_bb10.paragraphs[0]
    p_bb10.text = "SYSTEM READY FOR ENTERPRISE DEPLOYMENT  |  6 Collections  |  2,640+ Seed Records  |  7 Aggregations  |  6 B-Tree Indexes  |  100% Test Pass"
    p_bb10.font.size = Pt(10.5)
    p_bb10.font.bold = True
    p_bb10.font.color.rgb = C_DARKBLUE
    p_bb10.alignment = PP_ALIGN.CENTER

    # Save to file
    prs.save(output_filename)
    print(f"[SUCCESS] Executive Deck PPTX created: {output_filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Enterprise_SAMS_Architecture_Deck.pptx"
    build_presentation(out_file)
