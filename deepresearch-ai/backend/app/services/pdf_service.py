import io
from app.models.research import Report

import io
from app.models.research import Report
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.colors import Color

def draw_watermark(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 60)
    # Very light grey color
    canvas.setStrokeColor(Color(0, 0, 0, alpha=0.05))
    canvas.setFillColor(Color(0, 0, 0, alpha=0.05))
    
    # Draw at an angle in the middle of the page
    canvas.translate(4.25 * inch, 5.5 * inch)
    canvas.rotate(45)
    canvas.drawCentredString(0, 0, "research.io")
    canvas.restoreState()

def generate_report_pdf(report: Report) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=1)) # 1 is Center, 4 is Justified
    
    Story = []
    
    # Title
    Story.append(Paragraph(report.title or "Research Report", styles['Title']))
    Story.append(Spacer(1, 0.5 * inch))
    
    # Metadata
    metadata_style = styles["Normal"]
    Story.append(Paragraph(f"<b>Quality Score:</b> {report.quality_score}/10", metadata_style))
    Story.append(Paragraph(f"<b>Date Generated:</b> {report.created_at.strftime('%Y-%m-%d %H:%M:%S') if report.created_at else 'N/A'}", metadata_style))
    Story.append(Spacer(1, 0.3 * inch))
    
    # Content
    if report.content:
        # Split by double newlines for paragraphs
        paragraphs = report.content.split('\n\n')
        for p in paragraphs:
            if not p.strip():
                continue
            # Simple sanitization for XML-like tags (reportlab uses them)
            clean_p = p.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            Story.append(Paragraph(clean_p, styles["Normal"]))
            Story.append(Spacer(1, 0.1 * inch))
            
    # Citations
    if report.citations:
        Story.append(PageBreak())
        Story.append(Paragraph("References", styles['Heading2']))
        Story.append(Spacer(1, 0.2 * inch))
        for i, cite in enumerate(report.citations):
            cite_text = f"[{i+1}] {cite.get('title', 'Unknown')} - {cite.get('url', '')}"
            Story.append(Paragraph(cite_text, styles["Normal"]))
            Story.append(Spacer(1, 0.05 * inch))

    doc.build(Story, onFirstPage=draw_watermark, onLaterPages=draw_watermark)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
