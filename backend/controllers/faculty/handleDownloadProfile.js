import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
} from "docx";

export const handleDownloadProfile = async (req, res) => {
    try {
        const {
            facultyData,
            educationalQualifications,
            teachingExperience,
            subjectsHandled,
        } = req.body;

        const heading = (text) =>
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text, bold: true, size: 26 })],
            });

        const label = (text) =>
            new TextRun({ text, bold: true, size: 22 });

        const doc = new Document({
            sections: [
                {
                    children: [
                        heading("SELF – APPRAISAL FORM FOR FACULTY"),
                        heading("Academic Year 2023 – 2024"),
                        new Paragraph(""),

                        new Paragraph({
                            children: [
                                label("Name of the Faculty: "),
                                new TextRun(facultyData.name),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                label("Designation: "),
                                new TextRun(facultyData.designation),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                label("Department: "),
                                new TextRun(facultyData.department),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                label("Employee ID: "),
                                new TextRun(facultyData.employeeId),
                            ],
                        }),

                        new Paragraph("A.1 EDUCATIONAL QUALIFICATIONS"),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: ["Degree", "Branch", "College", "University", "Year", "%"]
                                        .map(h => new TableCell({
                                            children: [new Paragraph({ children: [label(h)] })],
                                        })),
                                }),
                                ...(educationalQualifications ? educationalQualifications.map(eq =>
                                    new TableRow({
                                        children: [
                                            eq.degree,
                                            eq.branch,
                                            eq.college,
                                            eq.university,
                                            eq.year,
                                            eq.percentage,
                                        ].map(val =>
                                            new TableCell({ children: [new Paragraph(val)] })
                                        ),
                                    })
                                ) : []),
                            ],
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${facultyData.name}_Self_Appraisal.docx`
        );

        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate document" });
    }
};
