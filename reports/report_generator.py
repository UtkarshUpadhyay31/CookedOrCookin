from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image
)

from reportlab.lib.styles import getSampleStyleSheet


class ReportGenerator:

    def generate(
        self,
        readiness,
        eye_contact,
        stability,
        attention
    ):

        pdf = SimpleDocTemplate(
            "CookedOrCookin_Report.pdf"
        )

        styles = getSampleStyleSheet()

        content = []

        content.append(
            Paragraph(
                "CookedOrCookin Report",
                styles["Title"]
            )
        )

        content.append(
            Spacer(1,20)
        )

        content.append(
            Paragraph(
                f"Final Readiness: {readiness:.1f}",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Average Eye Contact: {eye_contact:.1f}%",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Average Stability: {stability:.1f}%",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Average Attention: {attention:.1f}%",
                styles["Normal"]
            )
        )

        content.append(
            Spacer(1,20)
        )

        content.append(
            Image(
                "readiness_graph.png",
                width=400,
                height=200
            )
        )

        pdf.build(content)