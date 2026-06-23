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
        attention,
        presence,
        integrity,
        face_events,
        session_status,
        auto_ended,
        graph_path="readiness_graph.png"
    ):

        pdf = SimpleDocTemplate(
            "CookedOrCookin_Report.pdf"
        )

        styles = getSampleStyleSheet()

        content = []

        # ==========================
        # Title
        # ==========================

        content.append(
            Paragraph(
                "CookedOrCookin Interview Report",
                styles["Title"]
            )
        )

        content.append(
            Spacer(1, 20)
        )

        # ==========================
        # Performance Summary
        # ==========================

        content.append(
            Paragraph(
                "Interview Performance Summary",
                styles["Heading2"]
            )
        )

        content.append(
            Paragraph(
                f"Final Readiness Score: {readiness:.1f}",
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
            Spacer(1, 20)
        )

        # ==========================
        # Integrity Analysis
        # ==========================

        content.append(
            Paragraph(
                "Interview Integrity Analysis",
                styles["Heading2"]
            )
        )

        content.append(
            Paragraph(
                f"Presence Score: {presence:.1f}%",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Multiple Face Events: {face_events}",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Integrity Score: {integrity:.1f}",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Session Status: {session_status}",
                styles["Normal"]
            )
        )

        content.append(
            Paragraph(
                f"Auto Terminated: {'Yes' if auto_ended else 'No'}",
                styles["Normal"]
            )
        )

        content.append(
            Spacer(1, 20)
        )

        # ==========================
        # Final Verdict
        # ==========================

        if session_status == "INVALID":
            verdict = "SESSION INVALID"

        elif readiness >= 85:
            verdict = "COOKIN"

        elif readiness >= 70:
            verdict = "GOOD"

        elif readiness >= 50:
            verdict = "NEEDS PRACTICE"

        else:
            verdict = "COOKED"

        content.append(
            Paragraph(
                f"Final Verdict: {verdict}",
                styles["Heading2"]
            )
        )

        content.append(
            Spacer(1, 20)
        )

        # ==========================
        # Graph
        # ==========================

        try:

            content.append(
                Paragraph(
                    "Readiness Trend Graph",
                    styles["Heading2"]
                )
            )

            content.append(
                Spacer(1, 10)
            )

            content.append(
                Image(
                    graph_path,
                    width=450,
                    height=250
                )
            )

        except Exception:

            content.append(
                Paragraph(
                    "Graph not available.",
                    styles["Normal"]
                )
            )

        # ==========================
        # Generate PDF
        # ==========================

        pdf.build(content)

        print(
            "CookedOrCookin_Report.pdf generated successfully!"
        )