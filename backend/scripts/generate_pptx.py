import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = Presentation()
    # 16:9 Widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]

    # Scientific Dark Theme Palette (ASTRA-X / CASSIN X)
    BG_DARK = RGBColor(11, 15, 23)        # #0B0F17
    SURFACE_DARK = RGBColor(17, 24, 38)   # #111826
    RAISED_DARK = RGBColor(22, 32, 51)    # #162033
    BORDER_COLOR = RGBColor(36, 48, 68)   # #243044
    ACCENT_SKY = RGBColor(56, 189, 248)   # #38BDF8
    ACCENT_EMERALD = RGBColor(52, 211, 153) # #34D399
    ACCENT_AMBER = RGBColor(251, 191, 36)  # #FBBF24
    TEXT_WHITE = RGBColor(248, 250, 252)  # #F8FAFC
    TEXT_SILVER = RGBColor(229, 231, 235) # #E5E7EB
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8

    def add_blank_slide():
        slide = prs.slides.add_slide(blank_slide_layout)
        # Background rect
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return slide

    def add_header(slide, kicker, title, subtitle=None):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Kicker
        p_kicker = tf.paragraphs[0]
        p_kicker.text = kicker.upper()
        p_kicker.font.size = Pt(11)
        p_kicker.font.bold = True
        p_kicker.font.color.rgb = ACCENT_SKY
        p_kicker.space_after = Pt(4)

        # Title
        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.font.name = "Georgia"

        if subtitle:
            p_title.space_after = Pt(4)
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=SURFACE_DARK, border_color=BORDER_COLOR):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        return shape

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = add_blank_slide()

    # Decorative top glow bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(1.8), Inches(0.06))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_SKY
    bar.line.color.rgb = ACCENT_SKY

    tb = s1.shapes.add_textbox(Inches(0.8), Inches(2.1), Inches(11.5), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "RESEARCH PLATFORM PRESENTATION"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_SKY
    p0.space_after = Pt(10)

    p1 = tf.add_paragraph()
    p1.text = "ASTRA-X"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = "Georgia"
    p1.space_after = Pt(8)

    p2 = tf.add_paragraph()
    p2.text = "Planetary Terrestrial Analog Discovery & Characterization Platform"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_EMERALD
    p2.space_after = Pt(16)

    p3 = tf.add_paragraph()
    p3.text = '"Discover Earth. Understand Other Worlds. Prepare for Exploration."'
    p3.font.size = Pt(14)
    p3.font.italic = True
    p3.font.color.rgb = TEXT_SILVER
    p3.space_after = Pt(36)

    p4 = tf.add_paragraph()
    p4.text = "Developed by Team CASSIN X  |  NASA & Open Planetary Science Standards"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 2: RESEARCH PROBLEM & MOTIVATION
    # ==========================================
    s2 = add_blank_slide()
    add_header(s2, "Executive Context", "The Planetary Analog Challenge", "Why quantitative Earth analog identification is mission-critical for lunar and Martian exploration.")

    # 3 Cards
    col_w = Inches(3.64)
    gap = Inches(0.4)
    top_pos = Inches(2.1)
    card_h = Inches(4.6)

    # Card 1: Traditional Method
    add_card(s2, Inches(0.8), top_pos, col_w, card_h)
    tb1 = s2.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), col_w - Inches(0.4), card_h - Inches(0.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "01 / Traditional Problem"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p.space_after = Pt(12)

    p = tf1.add_paragraph()
    p.text = "Ad-Hoc Site Selection"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(10)

    p = tf1.add_paragraph()
    p.text = "Historically, planetary surface test sites (rover mobility, EVA field trials, radar testing) were chosen subjectively or through tradition without mathematical comparison to landing sites."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf1.add_paragraph()
    p.text = "• Qualitative assumptions\n• Unverifiable claims\n• Spatial scale mismatches\n• Hidden terrain differences"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_SILVER

    # Card 2: The Core Question
    add_card(s2, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, bg_color=RAISED_DARK, border_color=ACCENT_SKY)
    tb2 = s2.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), col_w - Inches(0.4), card_h - Inches(0.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "02 / The Research Question"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(12)

    p = tf2.add_paragraph()
    p.text = '"Given a selected region on Mars or Moon, which Earth locations match?"'
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.font.name = "Georgia"
    p.space_after = Pt(12)

    p = tf2.add_paragraph()
    p.text = "ASTRA-X establishes a repeatable, quantitative, explainable data engine connecting satellite topography of other worlds to terrestrial geology."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_SILVER
    p.space_after = Pt(10)

    p = tf2.add_paragraph()
    p.text = "• Open elevation baselines\n• Standardized 500m scale\n• Multi-attribute distance\n• Full feature explanation"
    p.font.size = Pt(12)
    p.font.color.rgb = ACCENT_SKY

    # Card 3: Mission Impact
    add_card(s2, Inches(0.8) + (col_w + gap) * 2, top_pos, col_w, card_h)
    tb3 = s2.shapes.add_textbox(Inches(1.0) + (col_w + gap) * 2, top_pos + Inches(0.2), col_w - Inches(0.4), card_h - Inches(0.4))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "03 / Mission Value"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    p.space_after = Pt(12)

    p = tf3.add_paragraph()
    p.text = "Exploration Readiness"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(10)

    p = tf3.add_paragraph()
    p.text = "Enables aerospace agencies, roboticists, and planetary scientists to validate instruments, simulate traversability, and rehearse EVAs with verified terrain fidelity."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf3.add_paragraph()
    p.text = "• Rover chassis validation\n• Autonomous path testing\n• Astronaut EVA rehearsal\n• Geological sensor testing"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_SILVER

    # ==========================================
    # SLIDE 3: SCIENTIFIC METHODOLOGY & 3-STEP PIPELINE
    # ==========================================
    s3 = add_blank_slide()
    add_header(s3, "Architecture & Pipeline", "The ASTRA-X Three-Step Process", "A transparent data pipeline transforming planetary observations into ranked terrestrial analog sites.")

    step_w = Inches(3.64)
    step_gap = Inches(0.4)
    step_top = Inches(2.1)
    step_h = Inches(4.6)

    # Step 1
    add_card(s3, Inches(0.8), step_top, step_w, step_h)
    tb = s3.shapes.add_textbox(Inches(1.0), step_top + Inches(0.2), step_w - Inches(0.4), step_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 01"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Orbital Observation Input"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(12)

    p = tf.add_paragraph()
    p.text = "Users either upload an orbital image (PNG, JPG, TIFF) of an unexplored Martian or Lunar feature, or search curated IAU planetary nomenclature landmarks (e.g., Gale, Jezero, Tycho)."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Key Attributes:\n• Celestial Body: Mars / Moon\n• Ground Resolution: ~6m/px\n• Target Coordinates: Lat / Lon\n• Sensor: MRO CTX / LRO WAC"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # Step 2
    add_card(s3, Inches(0.8) + step_w + step_gap, step_top, step_w, step_h)
    tb = s3.shapes.add_textbox(Inches(1.0) + step_w + step_gap, step_top + Inches(0.2), step_w - Inches(0.4), step_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 02"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Morphometric Extraction"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(12)

    p = tf.add_paragraph()
    p.text = "ASTRA-X harmonizes planetary and terrestrial grids to a standardized 500m scale. It extracts residual relative elevation, 2D Horn slope gradient, and residual roughness."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Mathematical Features:\n• Relative Elevation: z - mean_z\n• Horn Slope: 2D finite difference\n• Surface Roughness: 5x5 window\n• Robust median IQR scaling"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # Step 3
    add_card(s3, Inches(0.8) + (step_w + step_gap) * 2, step_top, step_w, step_h)
    tb = s3.shapes.add_textbox(Inches(1.0) + (step_w + step_gap) * 2, step_top + Inches(0.2), step_w - Inches(0.4), step_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STEP 03"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Ranking & Explainability"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(12)

    p = tf.add_paragraph()
    p.text = "Ranks Earth candidate sites using weighted Euclidean distance. Reports independent Similarity and Confidence metrics with full feature delta breakdowns."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Deliverables:\n• 3D Flying Earth Globe View\n• Feature Delta Bar Charts\n• 'Why It Matches' rationales\n• Exports: KML, GeoJSON, PDF"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # ==========================================
    # SLIDE 4: THE CORE MATHEMATICAL ENGINE
    # ==========================================
    s4 = add_blank_slide()
    add_header(s4, "Quantitative Science", "Feature Standardization & Similarity Metric", "Comparing topography across planets requires rigorous physical harmonization.")

    # Left Card: The Features
    left_w = Inches(5.6)
    add_card(s4, Inches(0.8), Inches(2.1), left_w, Inches(4.6))
    tb = s4.shapes.add_textbox(Inches(1.0), Inches(2.3), left_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "PHYSICAL TERRAIN FEATURES (500m Grid)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "1. Relative Elevation (Residual Relief)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p = tf.add_paragraph()
    p.text = "Raw elevation cannot be compared due to different planetary radii and geoid datums. We detrend the surface: z_rel = z - mean(z) within the tile."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "2. 2D Horn Slope Gradient (degrees)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p = tf.add_paragraph()
    p.text = "Computed using Horn's 8-neighbourhood finite-difference convolution. Correctly accounts for grid spacing across spherical coordinates."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "3. Terrain Roughness (meters)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p = tf.add_paragraph()
    p.text = "Calculated as the standard deviation of detrended elevation within a 5x5 kernel, capturing micro-topographic texture."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # Right Card: The Formula & Rule 8
    right_w = Inches(5.6)
    right_left = Inches(6.8)
    add_card(s4, right_left, Inches(2.1), right_w, Inches(4.6), bg_color=RAISED_DARK)
    tb = s4.shapes.add_textbox(right_left + Inches(0.2), Inches(2.3), right_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "SIMILARITY VS CONFIDENCE SEPARATION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Weighted Distance Model:"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p = tf.add_paragraph()
    p.text = "D = sqrt( sum( w_i * ( (f_target - f_cand) / IQR_i )^2 ) )\nSimilarity = max(0, 100 * (1 - D / D_max))"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(14)

    p = tf.add_paragraph()
    p.text = "Mandatory Scientific Honesty (Rule 8):"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf.add_paragraph()
    p.text = "Similarity and Confidence are NEVER merged into one vanity number:\n\n• Similarity: Physical morphometric affinity (0 - 100%)\n• Confidence: Dataset quality, coverage fraction, and spatial resolution match\n• Mission Suitability: Dedicated screening thresholds (never certified landing safety)"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # ==========================================
    # SLIDE 5: OPEN SATELLITE DATASETS
    # ==========================================
    s5 = add_blank_slide()
    add_header(s5, "Data Lineage", "Open Elevation & Altimetry Datasets", "Real spatial datasets ingested with verifiable provenance, license, and resolution.")

    # Table of datasets
    rows, cols = 5, 5
    left = Inches(0.8)
    top = Inches(2.1)
    width = Inches(11.733)
    height = Inches(4.6)

    table_shape = s5.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    # Column widths
    table.columns[0].width = Inches(2.8)
    table.columns[1].width = Inches(1.8)
    table.columns[2].width = Inches(2.2)
    table.columns[3].width = Inches(2.2)
    table.columns[4].width = Inches(2.733)

    headers = ["Dataset Name", "Body", "Source Agency", "Native Resolution", "Role in ASTRA-X"]
    data = [
        ["NASA SRTM / NASADEM", "Earth", "NASA / USGS", "30 m (1 arc-sec)", "Primary Earth baseline"],
        ["MGS MOLA MEGDR", "Mars", "NASA PDS / MGS", "463 m (128 px/deg)", "Martian global altimetry"],
        ["LRO LOLA DEM", "Moon", "NASA PDS / LRO", "118 m (512 px/deg)", "Lunar global topography"],
        ["IAU Planetary Gazetteer", "Multi-Body", "USGS / IAU WGPSN", "Point coordinates", "Planetary nomenclature"],
    ]

    for c_idx, h in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RAISED_DARK
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SKY

    for r_idx, row in enumerate(data):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = SURFACE_DARK
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_WHITE if c_idx == 0 else TEXT_MUTED

    # ==========================================
    # SLIDE 6: INTERACTIVE DISCOVERY & 3D EARTH GLOBE
    # ==========================================
    s6 = add_blank_slide()
    add_header(s6, "User Experience", "Interactive Discovery & 3D Google Earth View", "A streamlined single-flow interface connecting search to real-time spatial exploration.")

    # 4 Feature Columns
    card_w = Inches(2.7)
    gap_w = Inches(0.3)
    for idx, (title, tag, desc) in enumerate([
        ("Unified Search Bar", "Type-Ahead", "Instant autocomplete searching hundreds of IAU craters and landmarks, with Mars and Moon toggles."),
        ("Inline Image Upload", "Local Texture", "Drag-and-drop or file picker for local PNG/JPG/TIFF orbital imagery with thumbnail processing."),
        ("Google Earth Spin", "Dynamic Viewport", "Smooth auto-rotating 3D Earth globe that pauses and dynamically flies (flyTo) to matched candidate coordinates."),
        ("Pop-Out Candidate Dossier", "Live Pop-out", "Interactive card showing real satellite image, site coordinates, Similarity % and Confidence %."),
    ]):
        pos_x = Inches(0.8) + (card_w + gap_w) * idx
        add_card(s6, pos_x, Inches(2.1), card_w, Inches(4.6))
        tb = s6.shapes.add_textbox(pos_x + Inches(0.15), Inches(2.3), card_w - Inches(0.3), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"FEATURE 0{idx+1}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SKY
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_after = Pt(10)

        p = tf.add_paragraph()
        p.text = f"[{tag}]"
        p.font.size = Pt(11)
        p.font.color.rgb = ACCENT_EMERALD
        p.space_after = Pt(12)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 7: EXPLAINABLE ANALYTICS & STATS GRAPH
    # ==========================================
    s7 = add_blank_slide()
    add_header(s7, "Explainable AI & Diagnostics", "Transparent Match Explanations & Statistics", "Every match is broken down into physical components and comparative graphs.")

    # Left: Explanation Breakdown
    add_card(s7, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.6))
    tb = s7.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "SCIENTIFIC EXPLANABILITY ENGINE"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Why It Matches (Concordance):"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    p = tf.add_paragraph()
    p.text = "• Relative relief within ±12m of target caldera floor\n• Low slope gradient (< 3.5°) matching rover transit zones\n• Surface roughness standard deviation within 0.15 IQR"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER
    p.space_after = Pt(14)

    p = tf.add_paragraph()
    p.text = "How It Differs (Geological Nuances):"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p = tf.add_paragraph()
    p.text = "• Atmospheric weathering and fluvial drainage on Earth\n• Martian impact gardened basaltic regolith\n• Gravity difference (3.71 m/s² vs 9.81 m/s²)"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # Right: Recharts Statistics Graph & Exports
    add_card(s7, Inches(6.8), Inches(2.1), Inches(5.6), Inches(4.6), bg_color=RAISED_DARK)
    tb = s7.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "MORPHOMETRY STATISTICS & EXPORTS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD
    p.space_after = Pt(10)

    p = tf.add_paragraph()
    p.text = "Comparative Diagnostics Chart"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p = tf.add_paragraph()
    p.text = "Visual bar and radar charts built in Recharts compare target vs candidate features side-by-side with exact mathematical delta contributions."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(14)

    p = tf.add_paragraph()
    p.text = "Standardized Geospatial Exports:"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p = tf.add_paragraph()
    p.text = "• Google Earth (.kml) with embedded placemarks\n• GIS Feature Collections (.geojson)\n• Tabular Attribute Exports (.csv)\n• Publication-Ready Scientific Dossier (.pdf via ReportLab)"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_SILVER

    # ==========================================
    # SLIDE 8: BENCHMARK VALIDATION SITES
    # ==========================================
    s8 = add_blank_slide()
    add_header(s8, "Empirical Ground Truth", "Curated Benchmark Analog Validations", "Validation against literature-established Mars and Moon analog test sites.")

    benchmarks = [
        ("Atacama Yungay Basin, Chile", "Mars Analog • 97.7% Sim", "Hyper-arid desert basin exhibiting extreme soil desiccation and low slope variance comparable to Gale and Jezero crater plains."),
        ("Devon Island, Nunavut", "Mars Analog • 96.6% Sim", "Haughton meteorite impact structure inside a polar desert, providing high morphometric fidelity for impact crater rims and ejecta."),
        ("Lanzarote Volcanic Field", "Moon Analog • 95.3% Sim", "Basaltic lava fields, collapse tubes, and ash cones mirroring lunar mare volcanic terrain and Apollo landing baselines."),
    ]

    for idx, (name, tag, desc) in enumerate(benchmarks):
        pos_x = Inches(0.8) + Inches(4.0) * idx
        add_card(s8, pos_x, Inches(2.1), Inches(3.64), Inches(4.6))
        tb = s8.shapes.add_textbox(pos_x + Inches(0.2), Inches(2.3), Inches(3.24), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"BENCHMARK 0{idx+1}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SKY
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = name
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_after = Pt(8)

        p = tf.add_paragraph()
        p.text = tag
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_EMERALD
        p.space_after = Pt(14)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 9: SYSTEM ARCHITECTURE & TECH STACK
    # ==========================================
    s9 = add_blank_slide()
    add_header(s9, "Technical Implementation", "Robust Full-Stack Scientific Architecture", "Engineered for speed, cross-platform reproducibility, and zero external database dependencies.")

    stack = [
        ("Frontend Application", "React 18 + TypeScript + Vite", "Tailwind CSS dark space design system, MapLibre GL geospatial map, Three.js 3D NASA globe, Recharts visualization."),
        ("FastAPI Backend", "Python 3.11 + Pydantic v2", "Asynchronous REST endpoints, schema validation, multi-attribute distance calculations, and ReportLab PDF compiler."),
        ("Scientific Computing", "NumPy + SciPy + Scikit-Learn", "2D Horn finite differences, 5x5 roughness filtering, IQR normalization, K-Means clustering, and DBSCAN anomaly detection."),
        ("Geospatial Storage", "SQLite + GeoTIFF Rasters", "Zero-setup embedded SQLite database with IAU nomenclature, local DEM rasters, and dynamic PIL hillshade rendering."),
    ]

    for idx, (title, tech, desc) in enumerate(stack):
        col = idx % 2
        row = idx // 2
        x = Inches(0.8) + Inches(6.0) * col
        y = Inches(2.1) + Inches(2.4) * row
        add_card(s9, x, y, Inches(5.6), Inches(2.1))
        tb = s9.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(5.2), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SKY

        p = tf.add_paragraph()
        p.text = tech
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 10: CONCLUSION & SUMMARY
    # ==========================================
    s10 = add_blank_slide()
    add_header(s10, "Summary & Vision", "ASTRA-X: Advancing Planetary Exploration", "Connecting the surface of Earth to the frontiers of Mars and the Moon.")

    add_card(s10, Inches(0.8), Inches(2.1), Inches(11.733), Inches(4.6), bg_color=RAISED_DARK, border_color=ACCENT_SKY)
    tb = s10.shapes.add_textbox(Inches(1.2), Inches(2.4), Inches(11.0), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "KEY TAKEAWAYS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SKY
    p.space_after = Pt(14)

    bullets = [
        ("Quantitative Discovery: ", "Replaces subjective analog selection with verifiable, standardized 500m morphometric distance."),
        ("Scientific Honesty: ", "Strict separation of similarity, confidence, and suitability. No fabricated data or false landing claims."),
        ("Seamless User Experience: ", "Unified search bar with local image upload, 3D Google Earth-style spinning globe, cinematic flyTo, and pop-outs."),
        ("Explainable Decision Support: ", "Complete mathematical breakdowns, Recharts comparative statistics graphs, and 1-click KML/GeoJSON/PDF exports."),
    ]

    for title_b, desc_b in bullets:
        p = tf.add_paragraph()
        p.text = "• "
        p.font.size = Pt(13)
        p.font.color.rgb = ACCENT_EMERALD

        run1 = p.add_run()
        run1.text = title_b
        run1.font.bold = True
        run1.font.color.rgb = TEXT_WHITE

        run2 = p.add_run()
        run2.text = desc_b
        run2.font.color.rgb = TEXT_SILVER
        p.space_after = Pt(12)

    p_end = tf.add_paragraph()
    p_end.text = "ASTRA-X  •  Developed by Team CASSIN X  •  NASA Space Apps & Open Planetary Standards"
    p_end.font.size = Pt(11)
    p_end.font.italic = True
    p_end.font.color.rgb = TEXT_MUTED
    p_end.space_before = Pt(16)

    # Save presentation
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "ASTRA-X_Presentation_Deck.pptx"
    create_deck(out_file)
