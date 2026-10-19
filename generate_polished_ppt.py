import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_polished_presentation(output_filename="Enterprise_SAMS_Architecture_Deck.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLEEK MODERN TECH PALETTE (Obsidian Slate + Integrated Neon Borders)
    # =========================================================================
    BG_DARK = RGBColor(11, 15, 25)          # Obsidian Slate 950 (#0B0F19)
    CARD_BG = RGBColor(21, 30, 46)          # Dark Slate 900 (#151E2E)
    CARD_INNER = RGBColor(28, 39, 58)       # Slate 850
    BORDER_SUBTLE = RGBColor(41, 56, 82)    # Subtle border (#293852)
    
    # Glowing / Electric Accents
    ACCENT_CYAN = RGBColor(56, 189, 248)    # Neon Sky / Cyan (#38BDF8)
    ACCENT_BLUE = RGBColor(96, 165, 250)    # Electric Blue (#60A5FA)
    ACCENT_EMERALD = RGBColor(52, 211, 153) # Neon Mint / Emerald (#34D399)
    ACCENT_AMBER = RGBColor(251, 191, 36)   # Amber Glow (#FBBF24)
    ACCENT_ROSE = RGBColor(244, 63, 94)     # Rose Red (#F43F5E)
    ACCENT_PURPLE = RGBColor(168, 85, 247)  # Violet (#A855F7)
    
    # Typography
    TEXT_WHITE = RGBColor(255, 255, 255)    # High contrast title
    TEXT_LIGHT = RGBColor(241, 245, 249)    # Slate 100 body headings
    TEXT_BODY = RGBColor(203, 213, 225)     # Slate 300 body description
    TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400 secondary info

    TOTAL_SLIDES = 10

    def apply_dark_canvas(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        
        # Sleek top ambient accent line
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.04))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = ACCENT_CYAN
        top_bar.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text, badge_pill=""):
        # Header textbox
        hb = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.733), Inches(0.95))
        tf = hb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_CYAN

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        # Glowing badge pill at top-right
        if badge_pill:
            badge_width = Inches(2.9)
            badge_left = Inches(12.533) - badge_width
            pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, badge_left, Inches(0.42), badge_width, Inches(0.4))
            pill.adjustments[0] = 0.25
            pill.fill.solid()
            pill.fill.fore_color.rgb = RGBColor(15, 23, 42)
            pill.line.color.rgb = ACCENT_CYAN
            pill.line.width = Pt(1)
            tf_p = pill.text_frame
            tf_p.word_wrap = True
            tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
            p_m = tf_p.paragraphs[0]
            p_m.text = badge_pill.upper()
            p_m.alignment = PP_ALIGN.CENTER
            p_m.font.size = Pt(9)
            p_m.font.bold = True
            p_m.font.color.rgb = ACCENT_CYAN

        # Header divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_SUBTLE
        line.line.color.rgb = BORDER_SUBTLE

    def add_footer(slide, current_page):
        fb = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.28))
        tf = fb.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"SAMS - Enterprise Student Attendance Management System   |   Abhishek VS & Ayush Naugariya   |   Slide {current_page:02d} of {TOTAL_SLIDES:02d}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MUTED

    def add_sleek_card(slide, left, top, width, height, title="", border_color=BORDER_SUBTLE, title_color=TEXT_WHITE):
        """
        Creates an executive dark card with a seamless, integrated border.
        Corner radius calibrated to 0.04 (modern 8px curve).
        Zero external lines or bars - 100% mathematically aligned rounded corners.
        """
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.adjustments[0] = 0.04
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.2), width - Inches(0.56), Inches(0.42))
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            
            r_dot = p.add_run()
            r_dot.text = "[o] "
            r_dot.font.size = Pt(12)
            r_dot.font.bold = True
            r_dot.font.color.rgb = border_color
            
            r_txt = p.add_run()
            r_txt.text = title
            r_txt.font.size = Pt(14)
            r_txt.font.bold = True
            r_txt.font.color.rgb = title_color

        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Executive Hero Canvas)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide1)

    aura = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.15), Inches(1.5), Inches(0.04))
    aura.fill.solid()
    aura.fill.fore_color.rgb = ACCENT_CYAN
    aura.line.fill.background()

    tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(1.3), Inches(11.333), Inches(2.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "ENTERPRISE ARCHITECTURE SHOWCASE   |   FULL-STACK NoSQL PLATFORM"
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_CYAN
    p0.space_after = Pt(8)

    p1 = tf1.add_paragraph()
    p1.text = "Student Attendance Management System"
    p1.font.size = Pt(38)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "A High-Throughput, Document-Oriented NoSQL Platform for Real-Time Academic Tracking & Institutional Analytics"
    p2.font.size = Pt(15)
    p2.font.color.rgb = ACCENT_BLUE

    # Frosted Value Proposition Card
    callout1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(3.65), Inches(11.333), Inches(1.4))
    callout1.adjustments[0] = 0.04
    callout1.fill.solid()
    callout1.fill.fore_color.rgb = CARD_BG
    callout1.line.color.rgb = ACCENT_EMERALD
    callout1.line.width = Pt(1.2)

    tb_call = slide1.shapes.add_textbox(Inches(1.3), Inches(3.8), Inches(10.733), Inches(1.1))
    tf_call = tb_call.text_frame
    tf_call.word_wrap = True
    p_tag = tf_call.paragraphs[0]
    p_tag.text = "CORE VALUE PROPOSITION & ARCHITECTURAL DIRECTIVE:"
    p_tag.font.size = Pt(10)
    p_tag.font.bold = True
    p_tag.font.color.rgb = ACCENT_EMERALD
    p_tag.space_after = Pt(4)

    p_val = tf_call.add_paragraph()
    p_val.text = '"Transforming fragmented academic record-keeping into a high-concurrency, auditable, and low-latency analytics platform powered by MongoDB, atomic bulk operations, and real-time aggregation pipelines."'
    p_val.font.size = Pt(12.5)
    p_val.font.italic = True
    p_val.font.color.rgb = TEXT_LIGHT

    # Metadata & Stat Badges Row
    badges = [
        ("ARCHITECTURE LEAD", "Abhishek VS", ACCENT_CYAN, Inches(1.0)),
        ("ANALYTICS & TEST LEAD", "Ayush Naugariya", ACCENT_EMERALD, Inches(3.95)),
        ("PERSISTENCE ENGINE", "MongoDB 7.x WiredTiger", ACCENT_AMBER, Inches(6.9)),
        ("APPLICATION RUNTIME", "Node.js 20 & React 18 SPA", ACCENT_PURPLE, Inches(9.85))
    ]
    for b_label, b_val, b_col, b_left in badges:
        b_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, b_left, Inches(5.35), Inches(2.78), Inches(1.35))
        b_card.adjustments[0] = 0.08
        b_card.fill.solid()
        b_card.fill.fore_color.rgb = CARD_BG
        b_card.line.color.rgb = b_col
        b_card.line.width = Pt(1.2)

        b_tb = slide1.shapes.add_textbox(b_left + Inches(0.2), Inches(5.5), Inches(2.38), Inches(1.05))
        b_tf = b_tb.text_frame
        b_tf.word_wrap = True
        bp1 = b_tf.paragraphs[0]
        bp1.text = b_label
        bp1.font.size = Pt(9)
        bp1.font.bold = True
        bp1.font.color.rgb = b_col
        bp1.space_after = Pt(4)

        bp2 = b_tf.add_paragraph()
        bp2.text = b_val
        bp2.font.size = Pt(12)
        bp2.font.bold = True
        bp2.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & SYSTEM OBJECTIVES
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide2)
    add_header(slide2, "Domain Bottlenecks & Strategic System Objectives", "Problem Analysis & Solution Scope", "Operational Scope")
    add_footer(slide2, 2)

    # Left Card: Legacy Bottlenecks (Rose Accent Border) - FILLS THE BOX!
    add_sleek_card(slide2, Inches(0.8), Inches(1.5), Inches(5.7), Inches(4.5), "The Legacy Operational Challenge", ACCENT_ROSE)
    tb2_l = slide2.shapes.add_textbox(Inches(1.08), Inches(2.02), Inches(5.14), Inches(3.85))
    tf2_l = tb2_l.text_frame
    tf2_l.word_wrap = True

    pts2_l = [
        ("Manual Ingestion Latency & Human Error:", "Traditional attendance relies on physical registers or detached spreadsheets, leading to data loss, transcript errors, and multi-day delays."),
        ("Burst Concurrency Bottlenecks:", "Campus class transitions force hundreds of instructors to submit records within a 10-minute window, causing severe lock contention in traditional RDBMS."),
        ("Delayed Regulatory Interventions:", "Mandatory 75% attendance thresholds cannot be enforced proactively when attendance records take weeks to manually audit and compile."),
        ("Absence of Audit Governance:", "Legacy spreadsheets lack cryptographic tampering prevention, granular Role-Based Access Control (RBAC), and reliable submission audit trails.")
    ]
    for i, (head, body) in enumerate(pts2_l):
        p = tf2_l.paragraphs[0] if i == 0 else tf2_l.add_paragraph()
        p.space_after = Pt(10)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11.5)
        r1.font.color.rgb = ACCENT_ROSE
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_BODY

    # Right Card: Strategic Objectives (Emerald Accent Border) - FILLS THE BOX!
    add_sleek_card(slide2, Inches(6.8), Inches(1.5), Inches(5.7), Inches(4.5), "Strategic Engineering Objectives", ACCENT_EMERALD)
    tb2_r = slide2.shapes.add_textbox(Inches(7.08), Inches(2.02), Inches(5.14), Inches(3.85))
    tf2_r = tb2_r.text_frame
    tf2_r.word_wrap = True

    pts2_r = [
        ("Sub-15ms Ingestion Latency:", "Enable instantaneous, single-click attendance recording for entire cohorts (60+ students per batch) via atomic database batch operations."),
        ("100% Idempotent Submissions:", "Guarantee that re-submitting or correcting attendance updates records in-place without generating duplicate entries, ensuring complete data integrity."),
        ("Live In-Engine Analytics:", "Provide academic deans and instructors with real-time institutional intelligence (defaulter lists, course health, daily trends) calculated directly in database memory."),
        ("Enterprise Cryptographic Security:", "Enforce stateless JSON Web Token (JWT) authentication, 10-round Bcrypt password hashing, and strict 3-tier Role-Based Access Control.")
    ]
    for i, (head, body) in enumerate(pts2_r):
        p = tf2_r.paragraphs[0] if i == 0 else tf2_r.add_paragraph()
        p.space_after = Pt(10)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11.5)
        r1.font.color.rgb = ACCENT_EMERALD
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(11)
        r2.font.color.rgb = TEXT_BODY

    # Bottom Stat Pills
    stat_pills = [
        ("< 15 ms", "WRITE INGESTION LATENCY", ACCENT_CYAN, Inches(0.8)),
        ("100%", "IDEMPOTENT & ZERO DUPLICATES", ACCENT_EMERALD, Inches(4.8)),
        ("REAL-TIME", "DEFAULTER & TREND INTELLIGENCE", ACCENT_AMBER, Inches(8.8))
    ]
    for s_val, s_lbl, s_col, s_left in stat_pills:
        sp = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, s_left, Inches(6.15), Inches(3.733), Inches(0.72))
        sp.adjustments[0] = 0.15
        sp.fill.solid()
        sp.fill.fore_color.rgb = CARD_BG
        sp.line.color.rgb = s_col
        sp.line.width = Pt(1.2)

        s_tb = slide2.shapes.add_textbox(s_left + Inches(0.2), Inches(6.2), Inches(3.333), Inches(0.62))
        s_tf = s_tb.text_frame
        sp1 = s_tf.paragraphs[0]
        sp1.text = s_val
        sp1.font.size = Pt(14)
        sp1.font.bold = True
        sp1.font.color.rgb = s_col
        sp1.space_after = Pt(1)

        sp2 = s_tf.add_paragraph()
        sp2.text = s_lbl
        sp2.font.size = Pt(8.5)
        sp2.font.bold = True
        sp2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 3: NoSQL SELECTION & ARCHITECTURE JUSTIFICATION
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide3)
    add_header(slide3, "NoSQL Database Selection & 3-Tier Layered Architecture", "Architecture & Technology Justification", "Tiered Design")
    add_footer(slide3, 3)

    # 3 Top Tier Cards - FILLS VERTICAL SPACE!
    tiers = [
        ("Tier 1: Presentation Layer", "React 18 SPA + Vite + Tailwind", [
            "Single Page Application with instant client-side routing",
            "Axios interceptor pipeline attaching JWT bearer tokens",
            "Responsive attendance matrix and Chart.js dashboards",
            "State management via React Context avoiding prop-drilling"
        ], ACCENT_CYAN, Inches(0.8)),
        ("Tier 2: Application API Layer", "Node.js 20 LTS + Express.js 4.x", [
            "Stateless RESTful API gateway on port 5000",
            "Cryptographic JWT signature verification middleware",
            "Role-Based Access Control (Admin, Faculty, Student)",
            "Mongoose ODM schema validation and atomic batch compiler"
        ], ACCENT_BLUE, Inches(4.8)),
        ("Tier 3: Persistence Layer", "MongoDB 7.x Community Server", [
            "WiredTiger high-concurrency document storage engine",
            "Compound B-Tree index traversal with Snappy compression",
            "Native multi-stage aggregation pipelines in database RAM",
            "Document-level write locking eliminating table contention"
        ], ACCENT_EMERALD, Inches(8.8))
    ]

    for title, subtitle, bullets, color, left_pos in tiers:
        add_sleek_card(slide3, left_pos, Inches(1.5), Inches(3.733), Inches(2.7), title, color)
        tb_t = slide3.shapes.add_textbox(left_pos + Inches(0.25), Inches(1.95), Inches(3.25), Inches(2.15))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True

        p_sub = tf_t.paragraphs[0]
        p_sub.text = subtitle
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = color
        p_sub.space_after = Pt(6)

        for b in bullets:
            p = tf_t.add_paragraph()
            p.text = "- " + b
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_BODY
            p.space_after = Pt(4)

    # Bottom Card: Architectural Justification - FILLS THE CARD!
    add_sleek_card(slide3, Inches(0.8), Inches(4.35), Inches(11.733), Inches(2.55), "Technical Justification: Why MongoDB over Relational RDBMS?", ACCENT_AMBER)
    tb3_bot = slide3.shapes.add_textbox(Inches(1.08), Inches(4.82), Inches(11.2), Inches(1.95))
    tf3_b = tb3_bot.text_frame
    tf3_b.word_wrap = True

    reasons = [
        ("Zero Object-Relational Impedance Mismatch:", "In full-stack JavaScript architectures, data naturally exists as JSON trees. Relational databases force developers to decompose objects across normalized tables and reconstruct them via expensive multi-table SQL joins. MongoDB natively stores and returns BSON/JSON, eliminating mapping overhead."),
        ("Document-Level Concurrency for Write-Heavy Bursts:", "Academic attendance creates severe write spikes at class changeovers. Traditional RDBMS table or page locks create major queue delays. MongoDB's WiredTiger storage engine utilizes document-level locking, ensuring that concurrent submissions across different classes never block each other."),
        ("Declarative In-Engine Multi-Stage Aggregations:", "Computing institutional metrics (e.g., student attendance percentage, defaulter warnings, monthly trends) in SQL requires complex nested subqueries. MongoDB's aggregation pipeline processes data as a clean stream executed directly in database RAM with zero ETL delay.")
    ]
    for i, (head, body) in enumerate(reasons):
        p = tf3_b.paragraphs[0] if i == 0 else tf3_b.add_paragraph()
        p.space_after = Pt(6)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_AMBER
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 4: DATABASE SCHEMA & DATA MODELING DESIGN
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide4)
    add_header(slide4, "Relational Modeling in NoSQL: Data Modeling & Schemas", "Data Engineering & Schema Design", "Schema Architecture")
    add_footer(slide4, 4)

    # Left Card: 6 Collections - FILLS THE 5.35" BOX!
    add_sleek_card(slide4, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "The 6 Core Production Collections", ACCENT_CYAN)
    tb4_l = slide4.shapes.add_textbox(Inches(1.08), Inches(2.0), Inches(5.14), Inches(4.75))
    tf4_l = tb4_l.text_frame
    tf4_l.word_wrap = True

    colls = [
        ("users Collection:", "name, email (unique), password (Bcrypt 10-round hash), role ('admin' | 'faculty' | 'student'), createdAt. Handles identity, authentication, and RBAC enforcement."),
        ("students Collection:", "regNo (unique), name, email, department, year, section ('D1' | 'D2'), semester. Indexed on { department: 1, section: 1 } for fast cohort retrieval."),
        ("faculties Collection:", "facultyId (unique), name, email, department. Manages academic instructor profiles and departmental course linkages."),
        ("subjects Collection:", "subjectCode (unique), subjectName, facultyId (ref: Faculty), semester, credits. Defines curriculum catalog and faculty instructor assignment."),
        ("classes Collection:", "subjectId (ref: Subject), facultyId (ref: Faculty), date, startTime, endTime, room. Manages lecture timetable scheduling."),
        ("attendances Collection:", "classId (ref: Class), studentId (ref: Student), subjectId (ref: Subject), date, status ('Present' | 'Absent'), markedBy (ref: User). Compound indexed.")
    ]
    for i, (head, body) in enumerate(colls):
        p = tf4_l.paragraphs[0] if i == 0 else tf4_l.add_paragraph()
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # Right Card: Normalized Referencing vs Embedding - FILLS THE 5.35" BOX!
    add_sleek_card(slide4, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Design Pattern: Referencing vs. Embedding", ACCENT_AMBER)
    tb4_r = slide4.shapes.add_textbox(Inches(7.08), Inches(2.0), Inches(5.14), Inches(4.75))
    tf4_r = tb4_r.text_frame
    tf4_r.word_wrap = True

    p_pr = tf4_r.paragraphs[0]
    p_pr.text = "MATHEMATICAL PROOF: AVOIDING THE 16MB BSON LIMIT"
    p_pr.font.size = Pt(11)
    p_pr.font.bold = True
    p_pr.font.color.rgb = ACCENT_AMBER
    p_pr.space_after = Pt(6)

    proofs = [
        ("The 16MB Document Boundary:", "MongoDB enforces a strict hard ceiling of 16 Megabytes per individual document. Embedding attendance records inside the student document creates an unbounded array problem."),
        ("Growth Over Time:", "A 4-year degree consists of 8 semesters x 6 subjects = 48 subjects. With ~45 sessions per subject, each student accumulates over 2,160 attendance events. Each event with metadata consumes ~250 bytes."),
        ("Document Relocation on Disk:", "In WiredTiger, continuously growing embedded arrays cause documents to exceed their pre-allocated disk space, triggering expensive document relocations, severe storage fragmentation, and memory bloat."),
        ("The Normalized Referencing Solution:", "Storing attendance as individual documents linked via 12-byte ObjectId foreign keys keeps documents lightweight (~150 bytes), guarantees linear disk allocation, and enables horizontal scaling over decades of historical records."),
        ("Multi-Dimensional Query Efficiency:", "Normalized records allow instant queries like 'all students absent for Subject X on Date Y' using B-Tree indexes, avoiding expensive collection-wide nested array scans.")
    ]
    for head, body in proofs:
        p = tf4_r.add_paragraph()
        p.space_after = Pt(7)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = TEXT_WHITE
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 5: CORE IMPLEMENTATION & CRUD OPERATIONS
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide5)
    add_header(slide5, "Data Access Layer, Ingestion Pipelines & End-to-End CRUD", "Backend Engineering & Data Access", "CRUD & Scale")
    add_footer(slide5, 5)

    # Left Card: CRUD - FILLS THE 5.35" BOX!
    add_sleek_card(slide5, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Full-Stack RESTful CRUD Implementation", ACCENT_CYAN)
    tb5_l = slide5.shapes.add_textbox(Inches(1.08), Inches(2.0), Inches(5.14), Inches(4.75))
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
        p.space_after = Pt(9)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # Right Card: Ingestion & Scale - FILLS THE 5.35" BOX!
    add_sleek_card(slide5, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Automated Data Ingestion & Scale Testing", ACCENT_EMERALD)
    tb5_r = slide5.shapes.add_textbox(Inches(7.08), Inches(2.0), Inches(5.14), Inches(4.75))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    seed_pts = [
        ("Automated Ingestion Script (seed.js):", "Engineered an automated data generator that connects directly to MongoDB, purges stale collections, provisions Bcrypt-hashed credentials, and populates 60 students and 5 academic subjects."),
        ("2,640+ Realistic Primary Seed Records:", "Generates 25 consecutive instructional days of attendance across all enrolled subjects, delivering over 2,640 primary documents - far exceeding baseline prototype volumes."),
        ("Realistic Behavioral Cohorts:", "Models genuine human attendance patterns: Top Attendees (90-95%), Average Cohorts (75-88%), and Chronic Defaulters (62-70%), ensuring analytical queries return real, actionable outliers."),
        ("52,000+ Scalability Stress Dataset:", "Constructed an extended stress-testing script generating 52,000+ attendance records to empirically measure index selectivity, memory cache consumption, and execution plan transitions."),
        ("Strict UTC Date Normalization:", "All dates normalized via Date.UTC() at ingestion, guaranteeing consistent multi-timezone filtering and zero date-drift bugs during daily aggregation grouping.")
    ]
    for i, (head, body) in enumerate(seed_pts):
        p = tf5_r.paragraphs[0] if i == 0 else tf5_r.add_paragraph()
        p.space_after = Pt(9)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_EMERALD
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 6: ADVANCED NoSQL FEATURES & OPTIMIZATION
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide6)
    add_header(slide6, "Atomic Bulk Operations & B-Tree Index Optimization", "High-Performance Database Engineering", "Performance Optimization")
    add_footer(slide6, 6)

    # Left Card: bulkWrite() Protocol - FILLS THE 5.35" BOX!
    add_sleek_card(slide6, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Atomic bulkWrite() Batch Upsert Protocol", ACCENT_CYAN)
    tb6_l = slide6.shapes.add_textbox(Inches(1.08), Inches(2.0), Inches(5.14), Inches(4.75))
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
        p.space_after = Pt(7)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        if "bulkWrite(records" in body:
            r2.font.size = Pt(9.5)
            r2.font.color.rgb = ACCENT_AMBER
        else:
            r2.font.size = Pt(10.5)
            r2.font.color.rgb = TEXT_BODY

    # Right Card: Indexing & Benchmark - FILLS THE 5.35" BOX!
    add_sleek_card(slide6, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Compound Indexing & 50,000-Doc Benchmark", ACCENT_EMERALD)
    
    # Top ESR Explanation Textbox inside right card
    tb6_r_top = slide6.shapes.add_textbox(Inches(7.08), Inches(2.0), Inches(5.14), Inches(1.15))
    tf6_rt = tb6_r_top.text_frame
    tf6_rt.word_wrap = True

    p_esr = tf6_rt.paragraphs[0]
    p_esr.text = "THE ESR (EQUALITY, SORT, RANGE) RULE"
    p_esr.font.size = Pt(11)
    p_esr.font.bold = True
    p_esr.font.color.rgb = ACCENT_EMERALD
    p_esr.space_after = Pt(4)

    p_esr_b = tf6_rt.add_paragraph()
    p_esr_b.text = "Our primary compound index { studentId: 1, subjectId: 1, date: 1 } strictly adheres to the ESR rule: exact matches (studentId, subjectId) come first, followed by Range filters (date), ensuring optimal B-Tree branch traversal."
    p_esr_b.font.size = Pt(10.5)
    p_esr_b.font.color.rgb = TEXT_BODY

    # Dedicated Stat Boxes inside Right Card
    bm_data = [
        ("71x", "QUERY SPEEDUP", ACCENT_EMERALD, Inches(7.08)),
        ("99.99%", "FEWER DOCS EXAMINED", ACCENT_CYAN, Inches(9.55))
    ]
    for b_num, b_text, b_col, b_left in bm_data:
        b_box = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, b_left, Inches(3.25), Inches(2.35), Inches(0.85))
        b_box.adjustments[0] = 0.1
        b_box.fill.solid()
        b_box.fill.fore_color.rgb = CARD_INNER
        b_box.line.color.rgb = b_col
        b_box.line.width = Pt(1.2)

        b_tb = slide6.shapes.add_textbox(b_left + Inches(0.12), Inches(3.32), Inches(2.11), Inches(0.72))
        b_tf = b_tb.text_frame
        p_num = b_tf.paragraphs[0]
        p_num.text = b_num
        p_num.font.size = Pt(15)
        p_num.font.bold = True
        p_num.font.color.rgb = b_col
        p_num.space_after = Pt(1)

        p_lbl = b_tf.add_paragraph()
        p_lbl.text = b_text
        p_lbl.font.size = Pt(8)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = TEXT_MUTED

    # Bottom Benchmark Metrics Textbox (Larger Font, Fills Bottom!)
    tb6_r_bot = slide6.shapes.add_textbox(Inches(7.08), Inches(4.25), Inches(5.14), Inches(2.55))
    tf6_rb = tb6_r_bot.text_frame
    tf6_rb.word_wrap = True

    p_tbl = tf6_rb.paragraphs[0]
    p_tbl.text = "EMPIRICAL BENCHMARK METRICS (50,000 DOCUMENTS):"
    p_tbl.font.size = Pt(11)
    p_tbl.font.bold = True
    p_tbl.font.color.rgb = TEXT_WHITE
    p_tbl.space_after = Pt(6)

    bench_metrics = [
        ("Query Execution Plan:", "Without Index: COLLSCAN  |  With Compound Index: IXSCAN"),
        ("Total Documents Examined:", "Without Index: 50,000 docs  |  With Index: 3 docs (99.994% reduction)"),
        ("Query Execution Latency:", "Without Index: 28.4 ms  |  With Index: 0.4 ms (71x Speedup)"),
        ("In-Memory Sort Buffers:", "Without Index: Yes (RAM buffer)  |  With Index: Zero RAM allocated"),
        ("Overall Index Catalog:", "6 B-Trees deployed across users, students, subjects, and attendances.")
    ]
    for head, body in bench_metrics:
        p = tf6_rb.add_paragraph()
        p.space_after = Pt(5)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10)
        r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 7: ADVANCED ANALYTICS & COMPLEX QUERIES
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide7)
    add_header(slide7, "Multi-Stage Aggregation Pipelines & Institutional Intelligence", "In-Engine Analytical Processing", "Advanced Analytics")
    add_footer(slide7, 7)

    # 3 High-Value Pipeline Cards - FILLS THE 5.35" BOX!
    pipes = [
        ("Pipeline 1: Defaulters (<75%)", "GET /api/analytics/low-attendance?threshold=75", [
            ("Stage 1 ($group):", "Groups attendance by studentId; calculates total and present classes."),
            ("Stage 2 ($project):", "Computes percentage using $round, $multiply, and $divide operators."),
            ("Stage 3 ($match):", "Filters output documents where percentage is less than 75%."),
            ("Stage 4 ($lookup):", "Performs equality join with students to fetch student names and regNo."),
            ("Stage 5 ($sort):", "Sorts ascending so the most critical defaulters appear at the top.")
        ], "Impact: Replaces weeks of manual audits with an automated institutional warning list.", ACCENT_ROSE, Inches(0.8)),

        ("Pipeline 2: Course-Wise Variance", "GET /api/analytics/subject-percentage", [
            ("Stage 1 ($group):", "Groups by subjectId; sums total, present, and absent sessions."),
            ("Stage 2 ($project):", "Computes average attendance percentage per subject."),
            ("Stage 3 ($lookup):", "Joins with subjects collection to retrieve subjectCode and credits."),
            ("Stage 4 ($unwind):", "Flattens the subjectInfo array into an embedded object."),
            ("Stage 5 ($sort):", "Sorts descending by attendance percentage for comparative review.")
        ], "Impact: Highlights subjects suffering from abnormal absenteeism for dean review.", ACCENT_CYAN, Inches(4.8)),

        ("Pipeline 3: Daily & Monthly Trends", "GET /api/analytics/daily-stats", [
            ("Stage 1 ($group):", "Extracts date string via $dateToString: { format: '%Y-%m-%d' }."),
            ("Stage 2 ($sum):", "Calculates present vs absent student count per calendar day."),
            ("Stage 3 ($project):", "Computes institutional attendance rate per calendar date."),
            ("Stage 4 ($sort):", "Sorts chronologically by date string for time-series charts."),
            ("Monthly Pipeline:", "Extracts $year and $month to chart semester attendance progression.")
        ], "Impact: Powers time-series analytics charts to detect attendance dips near exam periods.", ACCENT_EMERALD, Inches(8.8))
    ]

    for title, endpoint, stages, impact, color, left_pos in pipes:
        add_sleek_card(slide7, left_pos, Inches(1.5), Inches(3.733), Inches(5.35), title, color)
        tb_p = slide7.shapes.add_textbox(left_pos + Inches(0.25), Inches(2.0), Inches(3.233), Inches(4.75))
        tf_p = tb_p.text_frame
        tf_p.word_wrap = True

        p_ep = tf_p.paragraphs[0]
        p_ep.text = endpoint
        p_ep.font.size = Pt(9.5)
        p_ep.font.bold = True
        p_ep.font.color.rgb = color
        p_ep.space_after = Pt(8)

        for st_head, st_desc in stages:
            p = tf_p.add_paragraph()
            p.space_after = Pt(6)
            r1 = p.add_run()
            r1.text = st_head + " "
            r1.font.bold = True
            r1.font.size = Pt(10.5)
            r1.font.color.rgb = TEXT_WHITE
            r2 = p.add_run()
            r2.text = st_desc
            r2.font.size = Pt(10)
            r2.font.color.rgb = TEXT_BODY

        p_imp = tf_p.add_paragraph()
        p_imp.space_before = Pt(10)
        r_ih = p_imp.add_run()
        r_ih.text = "Business " + impact
        r_ih.font.bold = True
        r_ih.font.size = Pt(10)
        r_ih.font.color.rgb = color

    # =========================================================================
    # SLIDE 8: USER INTERFACE & USABILITY
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide8)
    add_header(slide8, "Responsive Presentation Layer & User Experience Design", "Frontend Architecture & HCI", "UI & Usability")
    add_footer(slide8, 8)

    # Left Card: Persona Workflows - FILLS THE 5.35" BOX!
    add_sleek_card(slide8, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.35), "Persona-Tailored Academic Workflows", ACCENT_CYAN)
    tb8_l = slide8.shapes.add_textbox(Inches(1.08), Inches(2.0), Inches(5.14), Inches(4.75))
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
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # Right Card: Frontend Engineering - FILLS THE 5.35" BOX!
    add_sleek_card(slide8, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.35), "Frontend Architectural Rigor", ACCENT_BLUE)
    tb8_r = slide8.shapes.add_textbox(Inches(7.08), Inches(2.0), Inches(5.14), Inches(4.75))
    tf8_r = tb8_r.text_frame
    tf8_r.word_wrap = True

    fe_rigor = [
        ("React 18 SPA Architecture:", "Built on React 18 leveraging Virtual DOM diffing for rapid UI updates. Transitions between dashboard, marking, and analytics occur instantly without browser reloads."),
        ("Next-Gen Vite Build Tooling:", "Utilizes native browser ES Modules (ESM) during development, eliminating Webpack bundling overhead and delivering sub-second cold starts and instant Hot Module Replacement (HMR)."),
        ("Automated Axios Interceptor Pipeline:", "A centralized Axios request interceptor intercepts all outgoing HTTP calls, extracts the JWT token from localStorage, and injects the x-auth-token header automatically."),
        ("Centralized Global State Management:", "React Context API (AuthContext) manages active user sessions, token persistence, and role state, preventing fragile prop-drilling across the component hierarchy."),
        ("Tailwind CSS Design System:", "Clean dark slate navigation (#0F172A), frosted glass card elevation, rounded pill badges, and high-contrast Lucide SVG iconography.")
    ]
    for i, (head, body) in enumerate(fe_rigor):
        p = tf8_r.paragraphs[0] if i == 0 else tf8_r.add_paragraph()
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_BLUE
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 9: SYSTEM DEMONSTRATION FLOW
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide9)
    add_header(slide9, "End-to-End System Demonstration Flow", "Operational Walkthrough & Validation", "Live Demonstration")
    add_footer(slide9, 9)

    # 4 Sequential Demonstration Cards (2x2 Grid) - FILLS EACH CARD!
    demo_phases = [
        ("Phase 1: Identity & RBAC (0:00 - 1:00)", Inches(0.8), Inches(1.5), [
            ("Authentication:", "Log in as faculty@example.com with password123 via POST /api/auth/login."),
            ("Token Verification:", "Show JWT issuance, stateless token storage in localStorage, and payload decoding."),
            ("Role Governance:", "Demonstrate role-based UI orchestration: faculty sees attendance tools; admin sees user controls.")
        ], ACCENT_CYAN),

        ("Phase 2: Attendance Ingestion (1:00 - 2:30)", Inches(6.8), Inches(1.5), [
            ("Session Selection:", "Select Subject BCSE302P and calendar date; fetch 60 enrolled students."),
            ("1-Click Marking:", "Execute 'Mark All Present'; toggle specific students to 'Absent'."),
            ("bulkWrite() Proof:", "Click 'Save Attendance'; demonstrate 60 records saved in < 12ms via atomic batch upsert with zero page reload.")
        ], ACCENT_EMERALD),

        ("Phase 3: Analytics & Defaulters (2:30 - 3:45)", Inches(0.8), Inches(4.35), [
            ("Institutional KPIs:", "Open Analytics dashboard displaying 2,640+ total records and overall percentage."),
            ("Defaulter Detection:", "Run Pipeline 4 with threshold slider at 75%; instantaneously display identified students."),
            ("Trend Visualization:", "Inspect daily attendance timeline and section comparison ('D1' vs 'D2').")
        ], ACCENT_AMBER),

        ("Phase 4: Automated Test Suite (3:45 - 5:00)", Inches(6.8), Inches(4.35), [
            ("Test Runner:", "Execute node test_api.js directly in the integrated terminal."),
            ("28/28 Passing Tests:", "Demonstrate 100% green pass rate across Auth, CRUD on all 6 collections, and all 7 aggregations."),
            ("Quality Assurance:", "Verifies complete system correctness, error handling, and security defenses.")
        ], ACCENT_PURPLE)
    ]

    for title, left, top, steps, color in demo_phases:
        add_sleek_card(slide9, left, top, Inches(5.7), Inches(2.55), title, color)
        tb_d = slide9.shapes.add_textbox(left + Inches(0.28), top + Inches(0.55), Inches(5.14), Inches(1.9))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True

        for i, (st_head, st_desc) in enumerate(steps):
            p = tf_d.paragraphs[0] if i == 0 else tf_d.add_paragraph()
            p.space_after = Pt(6)
            r1 = p.add_run()
            r1.text = "- " + st_head + " "
            r1.font.bold = True
            r1.font.size = Pt(11)
            r1.font.color.rgb = color
            r2 = p.add_run()
            r2.text = st_desc
            r2.font.size = Pt(10.5)
            r2.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 10: CONCLUSION & FUTURE ENHANCEMENTS
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    apply_dark_canvas(slide10)
    add_header(slide10, "Project Achievements, Architectural Takeaways & Roadmap", "Executive Summary & Scalability", "Conclusion & Roadmap")
    add_footer(slide10, 10)

    # Left Card: Achievements - FILLS THE 4.5" BOX!
    add_sleek_card(slide10, Inches(0.8), Inches(1.5), Inches(5.7), Inches(4.5), "Key Architectural Achievements", ACCENT_EMERALD)
    tb10_l = slide10.shapes.add_textbox(Inches(1.08), Inches(2.0), Inches(5.14), Inches(3.85))
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
        p.space_after = Pt(7)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_EMERALD
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # Right Card: Scalability Roadmap - FILLS THE 4.5" BOX!
    add_sleek_card(slide10, Inches(6.8), Inches(1.5), Inches(5.7), Inches(4.5), "Production Scalability Roadmap", ACCENT_CYAN)
    tb10_r = slide10.shapes.add_textbox(Inches(7.08), Inches(2.0), Inches(5.14), Inches(3.85))
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
        p.space_after = Pt(9)
        r1 = p.add_run()
        r1.text = "- " + head + " "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = ACCENT_CYAN
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = TEXT_BODY

    # Bottom Banner: Sleek Enterprise Readiness Pill
    b_banner10 = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.72))
    b_banner10.adjustments[0] = 0.15
    b_banner10.fill.solid()
    b_banner10.fill.fore_color.rgb = CARD_BG
    b_banner10.line.color.rgb = ACCENT_CYAN
    b_banner10.line.width = Pt(1.2)

    tb_bb10 = slide10.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.5))
    tf_bb10 = tb_bb10.text_frame
    p_bb10 = tf_bb10.paragraphs[0]
    p_bb10.text = "SYSTEM PRODUCTION STATUS: READY FOR ENTERPRISE DEPLOYMENT  |  6 COLLECTIONS  |  2,640+ RECORDS  |  7 AGGREGATIONS  |  6 B-TREES  |  100% PASS"
    p_bb10.font.size = Pt(9.5)
    p_bb10.font.bold = True
    p_bb10.font.color.rgb = ACCENT_CYAN
    p_bb10.alignment = PP_ALIGN.CENTER

    prs.save(output_filename)
    print(f"[SUCCESS] Polished Keynote PPTX created: {output_filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Enterprise_SAMS_Architecture_Deck.pptx"
    build_polished_presentation(out_file)
