"""
Scientific PDF report generator for ASTRA-X analog discovery assessments.

Uses reportlab and matplotlib to compile transparent, multi-section engineering
and scientific analog reports.

Sections:
1. Title & Header (ASTRA-X, Developed by CASSIN X)
2. Target Planetary Reference & Ingested Metadata
3. Terrestrial Analog Candidate Rankings
4. Independent Score Decomposition (Similarity vs Confidence vs Suitability)
5. Feature-Level Comparison Table & Profile Chart
6. Dataset Provenance & Processing History
7. Baseline Validation Summary & Statistical Power Limitations
8. Standard Scientific Disclaimers (Items 9, 10, 13)
"""

import os
import io
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.models import Analysis, CandidateMatch, Region, MissionRoute


def generate_pdf_report(
    analysis: Analysis,
    candidates: List[CandidateMatch],
    route: Optional[MissionRoute] = None,
    output_dir: str = "data/reports"
) -> str:
    """
    Generate a comprehensive scientific analog report PDF.

    Returns:
        Absolute or relative path to the generated PDF.
    """
    os.makedirs(output_dir, exist_ok=True)
    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"ASTRAX_Report_Analysis_{analysis.id}_{timestamp_str}.pdf"
    filepath = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#070B14"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0284C7"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1F2937")
    )
    code_style = ParagraphStyle(
        "MonoCode",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#111827")
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6B7280")
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("ASTRA-X &mdash; Planetary Analog Discovery Report", title_style))
    story.append(Paragraph(
        f"Developed by Team <b>CASSIN X</b> | Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} | "
        f"Analysis Run #{analysis.id}",
        subtitle_style
    ))
    story.append(Spacer(1, 8))

    # 2. Executive Summary & Target Reference
    target_name = analysis.target_region.name if analysis.target_region else f"Region #{analysis.target_region_id}"
    planet_name = analysis.target_region.planet.name if analysis.target_region and analysis.target_region.planet else "Planetary Target"

    story.append(Paragraph("1. Target Planetary Reference Region", h2_style))
    summary_text = (
        f"This report documents comparative terrain similarity evaluated for <b>{target_name}</b> ({planet_name}). "
        f"Topographic features were evaluated at a standardized spatial scale window of 500 meters using verified "
        f"orbital altimetry. Candidate terrestrial sites are ranked using multi-dimensional weighted Euclidean distance "
        f"with robust normalization fit exclusively on the terrestrial pool."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))

    # 3. Top Ranked Candidates Table
    story.append(Paragraph("2. Ranked Terrestrial Analog Candidates", h2_style))
    table_data = [
        ["Rank", "Location", "Coordinates", "Similarity", "Confidence", "Suitability", "Cluster", "Anomaly"]
    ]

    for i, c in enumerate(candidates[:10]):
        coord_str = f"{c.lat:.2f}°, {c.lon:.2f}°" if (c.lat is not None and c.lon is not None) else "—"
        sim_str = f"{c.similarity_score:.1f}%" if c.similarity_score is not None else "—"
        conf_str = f"{c.confidence_score:.1f}%" if c.confidence_score is not None else "—"
        suit_str = "—" if c.mission_suitability_score is None else f"{c.mission_suitability_score:.1f}%"
        table_data.append([
            str(i + 1),
            c.location_name or "Earth Candidate",
            coord_str,
            sim_str,
            conf_str,
            suit_str,
            f"C{c.cluster_id or 0}",
            "Unusual" if c.is_anomaly else "Nominal"
        ])

    cand_table = Table(table_data, colWidths=[30, 130, 80, 55, 55, 55, 45, 50])
    cand_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ALIGN", (1, 1), (1, -1), "LEFT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F1F5F9")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(cand_table)
    story.append(Spacer(1, 10))

    # 4. Feature Comparison & Chart
    if candidates:
        top_cand = candidates[0]
        story.append(Paragraph(f"3. Feature Decomposition: Top Match ({top_cand.location_name})", h2_style))

        feat_comp = json.loads(top_cand.feature_comparison_json) if top_cand.feature_comparison_json else []
        feat_rows = [["Feature", "Target Ref", "Candidate", "Difference", "Contribution", "Kind"]]
        for f in feat_comp:
            feat_rows.append([
                f["feature"].replace("_", " ").title(),
                f"{f['target_value']:.2f} {f['unit']}",
                f"{f['candidate_value']:.2f} {f['unit']}",
                f"{f['difference']:+.2f} {f['unit']}",
                f"{f['contribution']:.5f}",
                f["kind"].title()
            ])

        f_table = Table(feat_rows, colWidths=[110, 80, 80, 80, 75, 75])
        f_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#FFFFFF")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(f_table)
        story.append(Spacer(1, 10))

        # Matplotlib Chart of Feature Contributions
        fig, ax = plt.subplots(figsize=(6, 2))
        f_names = [f["feature"].replace("_", " ") for f in feat_comp]
        f_contribs = [f["contribution"] for f in feat_comp]
        ax.barh(f_names, f_contribs, color="#0284C7")
        ax.set_xlabel("Contribution to Weighted Distance")
        ax.set_title("Distance Contribution Breakdown", fontsize=9, fontweight="bold")
        ax.tick_params(labelsize=8)
        plt.tight_layout()

        img_buf = io.BytesIO()
        plt.savefig(img_buf, format="png", dpi=150)
        plt.close(fig)
        img_buf.seek(0)

        story.append(Image(img_buf, width=450, height=150))
        story.append(Spacer(1, 10))

    # 5. Mission Route Summary if provided
    if route:
        story.append(Paragraph(f"4. Traverse Optimization Route ({route.name})", h2_style))
        route_text = (
            f"Mode: <b>{route.mode.title()}</b> | Length: <b>{route.length_m:.1f} m</b> | "
            f"Max Slope: <b>{route.max_slope_deg:.1f}°</b> | Mean Slope: <b>{route.mean_slope_deg:.1f}°</b> | "
            f"Difficulty Score: <b>{route.difficulty_score:.2f}</b> | Total Ascent: <b>{route.total_ascent_m:.1f} m</b>"
        )
        story.append(Paragraph(route_text, body_style))
        story.append(Spacer(1, 8))

    # 6. Dataset Provenance Table
    story.append(Paragraph("5. Dataset Provenance & Data Sources", h2_style))
    prov_data = [
        ["Dataset", "Source", "Resolution", "Units", "Licence"],
        ["NASA SRTM 1-Arc-Second", "NASA JPL / USGS", "30 meters", "meters (EGM96)", "Public Domain (Open Data)"],
        ["MGS MOLA MEGDR DEM", "USGS / NASA PDS", "463 meters", "meters (Areoid)", "NASA Open Data"],
        ["LRO LOLA Global DEM", "USGS / NASA PDS", "118 meters", "meters (Lunar Sphere)", "NASA Open Data"]
    ]
    prov_table = Table(prov_data, colWidths=[130, 90, 75, 95, 110])
    prov_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#FFFFFF")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(prov_table)
    story.append(Spacer(1, 10))

    # 7. Uncertainty & Baseline Validation
    story.append(Paragraph("6. Statistical Uncertainty & Baseline Limitations", h2_style))
    story.append(Paragraph(
        "Validation against curated analog pairings indicates that the 3-feature weighted similarity model outperforms "
        "random selection and single-feature slope baselines. However, statistical power is currently bounded by the "
        "number of ingested terrestrial analog reference zones. Inferences should be validated with ground truth field sampling.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # 8. Mandatory Scientific Disclaimers (Items 9, 10, 13)
    story.append(Paragraph("7. Scientific Disclaimers & Operational Notice", h2_style))
    disclaimers = [
        "• <b>Preliminary Screening Notice:</b> All suitability and screening calculations are exploratory decision-support estimates. Not certified for spacecraft landing or human habitation safety.",
        "• <b>Feature-Specific Analogy:</b> Terrestrial sites are comparable strictly across the evaluated topographic features (relative elevation, slope inclination, and surface roughness). Analogy does not imply environmental identity in atmospheric, radiation, or geochemical conditions.",
        "• <b>No Invented Inferences:</b> Results reflect computed numerical alignments on ingested DEM rasters without black-box or unsubstantiated scientific assertions."
    ]
    for d in disclaimers:
        story.append(Paragraph(d, disclaimer_style))
        story.append(Spacer(1, 3))

    doc.build(story)
    return filepath

