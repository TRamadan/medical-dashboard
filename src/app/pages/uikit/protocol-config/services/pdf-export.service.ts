import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Protocol, Phase, Exercise, getProtocolWeeks, getProtocolSessions } from '../models/protocol.model';
import { MessageService } from 'primeng/api';

import { MeasurementTemplatesService } from '../../measurements-config/services/measurement-templates.service';

@Injectable({
    providedIn: 'root'
})
export class PdfExportService {
    private messageService = inject(MessageService);
    private templatesService = inject(MeasurementTemplatesService);

    exportProtocolToPDF(proto: Protocol): void {
        if (!proto) return;

        // Fetch templates first to resolve IDs to names
        this.templatesService.getAllTemplates().subscribe({
            next: (templates) => this.generatePDF(proto, templates),
            error: () => this.generatePDF(proto, [])
        });
    }

    private generatePDF(proto: Protocol, templates: any[]): void {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ── BRAND COLORS ──
        const PRIMARY_BLUE: [number, number, number] = [19, 19, 55]; // #131337
        const ACCENT_TEAL: [number, number, number] = [112, 244, 195]; // #70F4C3
        const LIGHT_GRAY: [number, number, number] = [248, 250, 252];
        const MEDIUM_GRAY: [number, number, number] = [100, 116, 139];
        const TEXT_DARK: [number, number, number] = [30, 41, 59];

        // ── HEADER ──
        // Accent Background for header
        doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Logo / Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
        doc.text('The sports doctor', 14, 20); // Placeholder for brand name

        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text('Advanced Clinical Rehabilitation Protocol', 14, 28);

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(proto.name || 'Protocol Report', pageWidth - 14, 22, { align: 'right' });

        // Meta Info Header
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 30, { align: 'right' });
        doc.text(`Status: ${proto.status.toUpperCase()}`, pageWidth - 14, 34, { align: 'right' });
        if (proto.createdBy?.name) {
            doc.text(`Doctor: ${proto.createdBy.name}`, pageWidth - 14, 38, { align: 'right' });
        }

        // ── PROTOCOL OVERVIEW SECTION ──
        let currentY = 50;

        doc.setFontSize(14);
        doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Protocol Overview', 14, currentY);

        doc.setDrawColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
        doc.setLineWidth(1);
        doc.line(14, currentY + 2, 40, currentY + 2);

        currentY += 10;

        const totalWeeks = getProtocolWeeks(proto);
        const totalSessions = getProtocolSessions(proto);
        const services = (proto.services || [])
            .filter(s => s.selected)
            .map(s => s.serviceNameEn)
            .join(', ') || 'None';

        const generalInfo = [
            ['Condition', proto.injuryCondition || '—', 'Goal', proto.primaryGoal || '—'],
            ['Total Weeks', `${totalWeeks} Weeks`, 'Total Sessions', `${totalSessions} Sessions`],
            ['Athlete Level', proto.targetAthleteLevel || '—', 'Configuration', `${proto.phases.length} Phases`],
            ['Applied Services', services, '', '']
        ];

        autoTable(doc, {
            startY: currentY,
            body: generalInfo,
            theme: 'plain',
            styles: { cellPadding: 3, fontSize: 10, textColor: TEXT_DARK },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 35, textColor: MEDIUM_GRAY },
                1: { cellWidth: 60 },
                2: { fontStyle: 'bold', cellWidth: 35, textColor: MEDIUM_GRAY },
                3: { cellWidth: 60 }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 12;

        // ── CONTRAINDICATIONS (SAFETY FIRST) ──
        if (proto.contraindications?.length) {
            // First calculate required height
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            let totalTextHeight = 0;
            proto.contraindications.forEach(item => {
                const desc = typeof item === 'string' ? item : item.description;
                const lines = doc.splitTextToSize(`• ${desc}`, pageWidth - 36);
                totalTextHeight += lines.length * 5;
            });

            const boxHeight = totalTextHeight + 15;
            doc.setFillColor(254, 242, 242); // Light red-ish
            doc.rect(14, currentY, pageWidth - 28, boxHeight, 'F');
            doc.setFillColor(185, 28, 28); // Dark red left border
            doc.rect(14, currentY, 3, boxHeight, 'F');

            doc.setFontSize(10);
            doc.setTextColor(185, 28, 28);
            doc.setFont('helvetica', 'bold');
            doc.text('SAFETY & CONTRAINDICATIONS', 20, currentY + 6);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
            
            let contraY = currentY + 12;
            proto.contraindications.forEach((item) => {
                const desc = typeof item === 'string' ? item : item.description;
                const lines = doc.splitTextToSize(`• ${desc}`, pageWidth - 40);
                doc.text(lines, 22, contraY);
                contraY += lines.length * 5;
            });

            currentY += boxHeight + 10;
        }

        // ── PHASES ──
        const drawSectionLabel = (label: string, y: number, color: [number, number, number]) => {
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(14, y, 3, 5, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(label.toUpperCase(), 20, y + 3.8);
        };

        proto.phases.forEach((phase, phaseIdx) => {
            if (currentY > 220) {
                doc.addPage();
                currentY = 20;
            }

            // ── Phase Banner ──
            doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
            doc.rect(14, currentY, pageWidth - 28, 14, 'F');
            // Teal left accent bar
            doc.setFillColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
            doc.rect(14, currentY, 4, 14, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text(`PHASE ${phaseIdx + 1}: ${phase.name.toUpperCase()}`, 22, currentY + 9);

            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(ACCENT_TEAL[0], ACCENT_TEAL[1], ACCENT_TEAL[2]);
            doc.text(`${phase.totalWeeks} Weeks  ·  ${phase.sessionsPerWeek} Sessions / Week`, pageWidth - 18, currentY + 9, { align: 'right' });
            currentY += 18;

            // ── Phase Stats Bar ──
            const totalPhaseSessions = phase.totalWeeks * phase.sessionsPerWeek;
            const measurementCount = phase.measurementSessionNums?.length ?? 0;
            const exerciseSessionCount = totalPhaseSessions - measurementCount;

            const statsBoxes = [
                { label: 'Total Sessions', value: String(totalPhaseSessions) },
                { label: 'Exercise Sessions', value: String(exerciseSessionCount) },
                { label: 'Measurement Sessions', value: String(measurementCount) },
                { label: 'Transition Criteria', value: String(phase.criteria?.transitionCriteria?.length ?? 0) },
            ];
            const boxW = (pageWidth - 28) / statsBoxes.length;
            statsBoxes.forEach((box, bi) => {
                const bx = 14 + bi * boxW;
                doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
                doc.rect(bx, currentY, boxW - 1, 14, 'F');
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
                doc.text(box.value, bx + boxW / 2 - 0.5, currentY + 8, { align: 'center' });
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
                doc.text(box.label.toUpperCase(), bx + boxW / 2 - 0.5, currentY + 12.5, { align: 'center' });
            });
            currentY += 18;

            // ── Phase Objective ──
            if (phase.objective) {
                if (currentY > 250) { doc.addPage(); currentY = 20; }
                const OBJ_BLUE: [number, number, number] = [59, 130, 246]; // blue-500
                doc.setFillColor(239, 246, 255); // blue-50
                doc.rect(14, currentY, pageWidth - 28, 14, 'F');
                doc.setFillColor(OBJ_BLUE[0], OBJ_BLUE[1], OBJ_BLUE[2]);
                doc.rect(14, currentY, 3, 14, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(OBJ_BLUE[0], OBJ_BLUE[1], OBJ_BLUE[2]);
                doc.text('PHASE OBJECTIVE', 20, currentY + 5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
                const objLines = doc.splitTextToSize(phase.objective, pageWidth - 50);
                doc.text(objLines, 20, currentY + 10.5);
                currentY += Math.max(14, objLines.length * 4 + 8) + 4;
            }

            // ── In-Phase Criteria ──
            const criteriaEntries: Array<{ label: string; text: string; color: [number, number, number]; bg: [number, number, number] }> = [];
            if (phase.criteria?.progressionCriteria) criteriaEntries.push({ label: 'Progression Criteria', text: phase.criteria.progressionCriteria, color: [22, 163, 74], bg: [240, 253, 244] });
            if (phase.criteria?.regressionCriteria) criteriaEntries.push({ label: 'Regression Criteria', text: phase.criteria.regressionCriteria, color: [234, 88, 12], bg: [255, 247, 237] });
            if (phase.criteria?.precautions) criteriaEntries.push({ label: 'Precautions', text: phase.criteria.precautions, color: [220, 38, 38], bg: [254, 242, 242] });

            if (criteriaEntries.length) {
                if (currentY > 240) { doc.addPage(); currentY = 20; }
                drawSectionLabel('In-Phase Clinical Criteria', currentY, MEDIUM_GRAY);
                currentY += 7;

                criteriaEntries.forEach(entry => {
                    if (currentY > 255) { doc.addPage(); currentY = 20; }
                    const lines = doc.splitTextToSize(entry.text, pageWidth - 50);
                    const rowH = Math.max(12, lines.length * 4.5 + 7);
                    doc.setFillColor(entry.bg[0], entry.bg[1], entry.bg[2]);
                    doc.rect(14, currentY, pageWidth - 28, rowH, 'F');
                    doc.setFillColor(entry.color[0], entry.color[1], entry.color[2]);
                    doc.rect(14, currentY, 3, rowH, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(7.5);
                    doc.setTextColor(entry.color[0], entry.color[1], entry.color[2]);
                    doc.text(entry.label.toUpperCase(), 20, currentY + 5);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
                    doc.text(lines, 20, currentY + 10);
                    currentY += rowH + 2;
                });
                currentY += 4;
            }

            // ── Transition Criteria Table ──
            if (phase.criteria?.transitionCriteria?.length) {
                if (currentY > 230) { doc.addPage(); currentY = 20; }
                drawSectionLabel('Transition Criteria (Phase Advancement Gates)', currentY, [79, 70, 229]);
                currentY += 8;

                const transitionData: any[] = phase.criteria.transitionCriteria.map((c, ci) => [
                    { content: `#${ci + 1}`, styles: { halign: 'center', fontStyle: 'bold', textColor: MEDIUM_GRAY } },
                    { content: c.metric || '—', styles: { fontStyle: 'bold', textColor: TEXT_DARK } },
                    { content: c.operator || '—', styles: { halign: 'center', fontStyle: 'bold', textColor: [79, 70, 229] as [number, number, number], fontSize: 11 } },
                    { content: String(c.value ?? '—'), styles: { halign: 'center', fontStyle: 'bold', textColor: PRIMARY_BLUE } },
                    { content: c.unit || '—', styles: { halign: 'center', textColor: MEDIUM_GRAY } },
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'CLINICAL METRIC', 'OP', 'TARGET', 'UNIT']],
                    body: transitionData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [79, 70, 229] as [number, number, number],
                        textColor: [255, 255, 255] as [number, number, number],
                        fontSize: 7.5,
                        fontStyle: 'bold',
                        halign: 'center',
                        cellPadding: 3
                    },
                    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [226, 232, 240] as [number, number, number], lineWidth: 0.1 },
                    columnStyles: {
                        0: { cellWidth: 10, halign: 'center' },
                        1: { cellWidth: 65 },
                        2: { cellWidth: 15, halign: 'center' },
                        3: { cellWidth: 25, halign: 'center' },
                        4: { cellWidth: 'auto', halign: 'center' }
                    },
                    margin: { left: 14, right: 14 },
                });
                currentY = (doc as any).lastAutoTable.finalY + 10;
            } else {
                currentY += 4;
            }

            // ── Sessions & Exercises ──
            const INDIGO: [number, number, number] = [79, 70, 229];
            const GREEN: [number, number, number] = [22, 163, 74];
            const TEAL: [number, number, number] = [15, 118, 110];
            const RED_EX: [number, number, number] = [220, 38, 38];

            phase.weeks.forEach((week) => {
                week.sessions.forEach((session) => {
                    if (currentY > 245) { doc.addPage(); currentY = 20; }

                    const isMeasurement = phase.measurementSessionNums.includes(session.sessionNumber);

                    // ── Session Divider ──
                    const sessionBg: [number, number, number] = isMeasurement ? [241, 245, 249] : [238, 242, 255];
                    const sessionTc: [number, number, number] = isMeasurement ? [71, 85, 105] : PRIMARY_BLUE;
                    doc.setFillColor(sessionBg[0], sessionBg[1], sessionBg[2]);
                    doc.rect(14, currentY, pageWidth - 28, 10, 'F');
                    doc.setFillColor(isMeasurement ? 100 : INDIGO[0], isMeasurement ? 116 : INDIGO[1], isMeasurement ? 139 : INDIGO[2]);
                    doc.rect(14, currentY, 3, 10, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8.5);
                    doc.setTextColor(sessionTc[0], sessionTc[1], sessionTc[2]);
                    doc.text(
                        isMeasurement
                            ? `WEEK ${week.weekNumber}  ·  SESSION ${session.sessionNumber}  ·  MEASUREMENT SESSION`
                            : `WEEK ${week.weekNumber}  ·  SESSION ${session.sessionNumber}`,
                        20, currentY + 6.5
                    );
                    currentY += 12;

                    if (isMeasurement) {
                        const templateName = templates.find(t => t.id === session.measurementTemplateId)?.name || 'Not Assigned';
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
                        doc.text(`Assessment Template:  ${templateName}`, 22, currentY + 4);
                        currentY += 10;
                        return;
                    }

                    session.sections.forEach((section) => {
                        if (currentY > 250) { doc.addPage(); currentY = 20; }

                        // ── Section Header ──
                        doc.setFillColor(230, 244, 255);
                        doc.rect(14, currentY, pageWidth - 28, 8, 'F');
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(7.5);
                        doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
                        doc.text(`SECTION: ${section.sectionName.toUpperCase()}`, 18, currentY + 5.5);
                        if (section.time) {
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
                            doc.text(`Duration: ${section.time}`, pageWidth - 16, currentY + 5.5, { align: 'right' });
                        }
                        currentY += 10;

                        if (section.exercises.length === 0) {
                            doc.setFont('helvetica', 'italic');
                            doc.setFontSize(8);
                            doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
                            doc.text('No exercises configured for this section.', 22, currentY + 4);
                            currentY += 10;
                            return;
                        }

                        section.exercises.forEach((ex, exIdx) => {
                            if (currentY > 240) { doc.addPage(); currentY = 20; }

                            const isEx = ex.type === 'exercise';
                            const exerciseEx = isEx ? (ex as any) : null;
                            const sets: any[] = isEx ? (exerciseEx.sets || []) : [];

                            // ── Exercise Number Badge ──
                            const badgeColor: [number, number, number] = isEx ? PRIMARY_BLUE : [153, 27, 27];
                            doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
                            doc.roundedRect(14, currentY, 7, 7, 1, 1, 'F');
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(7);
                            doc.setTextColor(255, 255, 255);
                            doc.text(String(exIdx + 1), 17.5, currentY + 4.8, { align: 'center' });

                            // ── Exercise Name ──
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(10);
                            doc.setTextColor(isEx ? PRIMARY_BLUE[0] : RED_EX[0], isEx ? PRIMARY_BLUE[1] : RED_EX[1], isEx ? PRIMARY_BLUE[2] : RED_EX[2]);
                            doc.text(ex.name || '(Unnamed Exercise)', 24, currentY + 5);
                            currentY += 10;

                            // ── Exercise Properties Table ──
                            if (isEx) {
                                const propBody: any[] = [
                                    [
                                        { content: 'EQUIPMENT', styles: { fontStyle: 'bold' as const, fontSize: 7, textColor: MEDIUM_GRAY, cellPadding: { top: 2, bottom: 2, left: 3, right: 2 } } },
                                        { content: exerciseEx.equipment || 'No Equipment', styles: { fontSize: 8, textColor: TEXT_DARK, fontStyle: 'bold' as const, cellPadding: 2 } },
                                        { content: 'CONTRACTION', styles: { fontStyle: 'bold' as const, fontSize: 7, textColor: MEDIUM_GRAY, cellPadding: { top: 2, bottom: 2, left: 3, right: 2 } } },
                                        { content: exerciseEx.contractionType || '—', styles: { fontSize: 8, textColor: TEXT_DARK, cellPadding: 2 } },
                                        { content: 'INT. METHOD', styles: { fontStyle: 'bold' as const, fontSize: 7, textColor: MEDIUM_GRAY, cellPadding: { top: 2, bottom: 2, left: 3, right: 2 } } },
                                        { content: exerciseEx.intensityMethod || '—', styles: { fontSize: 8, textColor: TEAL, fontStyle: 'bold' as const, cellPadding: 2 } },
                                    ]
                                ];

                                autoTable(doc, {
                                    startY: currentY,
                                    body: propBody,
                                    theme: 'plain',
                                    styles: { lineColor: [226, 232, 240] as [number, number, number], lineWidth: 0.1 },
                                    tableLineColor: [226, 232, 240] as [number, number, number],
                                    tableLineWidth: 0.1,
                                    columnStyles: {
                                        0: { cellWidth: 24 },
                                        1: { cellWidth: 35 },
                                        2: { cellWidth: 24 },
                                        3: { cellWidth: 30 },
                                        4: { cellWidth: 24 },
                                        5: { cellWidth: 'auto' }
                                    },
                                    margin: { left: 22, right: 14 },
                                });
                                currentY = (doc as any).lastAutoTable.finalY + 3;

                                // ── Sets Table ──
                                if (sets.length > 0) {
                                    const setsBody: any[] = sets.map((set: any, si: number) => {
                                        const isEven = si % 2 === 0;
                                        const rowBg: [number, number, number] = isEven ? [255, 255, 255] : [248, 250, 252];
                                        return [
                                            { content: `${si + 1}`, styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 8, fillColor: rowBg, textColor: INDIGO } },
                                            { content: String(set.repetitions ?? '—'), styles: { halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 9, fillColor: rowBg, textColor: TEXT_DARK } },
                                            { content: set.intensity || '—', styles: { halign: 'center' as const, fontSize: 8.5, fontStyle: 'bold' as const, fillColor: rowBg, textColor: PRIMARY_BLUE } },
                                            { content: set.tempo || '—', styles: { halign: 'center' as const, fontSize: 8, fillColor: rowBg, textColor: TEXT_DARK } },
                                            { content: set.rest || '—', styles: { halign: 'center' as const, fontSize: 8, fontStyle: 'bold' as const, fillColor: rowBg, textColor: TEAL } },
                                        ];
                                    });

                                    autoTable(doc, {
                                        startY: currentY,
                                        head: [[
                                            { content: 'SET', styles: { halign: 'center' as const } },
                                            { content: 'REPS', styles: { halign: 'center' as const } },
                                            { content: 'INTENSITY', styles: { halign: 'center' as const } },
                                            { content: 'TEMPO', styles: { halign: 'center' as const } },
                                            { content: 'REST', styles: { halign: 'center' as const } },
                                        ]],
                                        body: setsBody,
                                        theme: 'grid',
                                        headStyles: {
                                            fillColor: PRIMARY_BLUE,
                                            textColor: ACCENT_TEAL,
                                            fontSize: 7.5,
                                            fontStyle: 'bold',
                                            cellPadding: 3
                                        },
                                        styles: {
                                            fontSize: 8,
                                            cellPadding: 3,
                                            lineColor: [226, 232, 240] as [number, number, number],
                                            lineWidth: 0.15
                                        },
                                        columnStyles: {
                                            0: { cellWidth: 14 },
                                            1: { cellWidth: 20 },
                                            2: { cellWidth: 30 },
                                            3: { cellWidth: 25 },
                                            4: { cellWidth: 25 }
                                        },
                                        margin: { left: 22, right: 14 },
                                    });
                                    currentY = (doc as any).lastAutoTable.finalY + 3;
                                }
                            } else {
                                // Manual therapy card
                                const manualRows: any[] = [];
                                let videoRowIndex = -1;
                                if (ex.description) {
                                    manualRows.push([
                                        { content: 'DESCRIPTION', styles: { fontStyle: 'bold' as const, fontSize: 7, textColor: MEDIUM_GRAY, cellPadding: 2 } },
                                        { content: ex.description, styles: { fontSize: 8, textColor: TEXT_DARK, cellPadding: 2 } }
                                    ]);
                                }
                                const videoUrl = (ex as any).videoUrl;
                                if (videoUrl) {
                                    videoRowIndex = manualRows.length;
                                    manualRows.push([
                                        { content: 'VIDEO URL', styles: { fontStyle: 'bold' as const, fontSize: 7, textColor: MEDIUM_GRAY, cellPadding: 2 } },
                                        { content: videoUrl, styles: { fontSize: 7.5, textColor: [13, 148, 136] as [number, number, number], fontStyle: 'italic' as const, cellPadding: 2 } }
                                    ]);
                                }

                                if (manualRows.length) {
                                    autoTable(doc, {
                                        startY: currentY,
                                        body: manualRows,
                                        theme: 'plain',
                                        tableLineColor: [226, 232, 240] as [number, number, number],
                                        tableLineWidth: 0.1,
                                        columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 'auto' } },
                                        margin: { left: 22, right: 14 },
                                        didDrawCell: (data) => {
                                            if (videoUrl && data.section === 'body' && data.row.index === videoRowIndex && data.column.index === 1) {
                                                doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: videoUrl });
                                            }
                                        }
                                    });
                                    currentY = (doc as any).lastAutoTable.finalY + 3;
                                }
                            }

                            // ── Description (exercise type) ──
                            if (isEx && ex.description) {
                                const descLines = doc.splitTextToSize(`Description: ${ex.description}`, pageWidth - 50);
                                doc.setFont('helvetica', 'italic');
                                doc.setFontSize(7.5);
                                doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
                                doc.text(descLines, 22, currentY + 3);
                                currentY += descLines.length * 4 + 5;
                            }

                            // ── Progression Rule ──
                            if (ex.progressionRule?.title) {
                                doc.setFillColor(240, 253, 244);
                                const progH = 14;
                                doc.rect(22, currentY, pageWidth - 36, progH, 'F');
                                doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
                                doc.rect(22, currentY, 2.5, progH, 'F');
                                doc.setFont('helvetica', 'bold');
                                doc.setFontSize(7);
                                doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
                                doc.text('PROGRESSION RULE', 27, currentY + 4.5);
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(8);
                                doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
                                const progText = `${ex.progressionRule.title}   +${ex.progressionRule.incrementAmount ?? 0} if: ${ex.progressionRule.progressionCondition || '—'}`;
                                const progLines = doc.splitTextToSize(progText, pageWidth - 60);
                                doc.text(progLines, 27, currentY + 9.5);
                                currentY += Math.max(progH, progLines.length * 4 + 7) + 3;
                            }

                            // Thin separator between exercises
                            doc.setDrawColor(219, 234, 254);
                            doc.setLineWidth(0.3);
                            doc.line(22, currentY, pageWidth - 14, currentY);
                            currentY += 6;
                        });

                        currentY += 4; // section gap
                    });
                });
            });

            currentY += 10; // phase gap
        });

        // ── FOOTER ──
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(MEDIUM_GRAY[0], MEDIUM_GRAY[1], MEDIUM_GRAY[2]);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            doc.setDrawColor(226, 232, 240);
            doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
            doc.text('THE SPORTS DOCTOR', 14, pageHeight - 10);
        }

        // Save & View
        const fileName = `${proto.name.replace(/\s+/g, '_')}_Protocol.pdf`;
        doc.save(fileName);

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');

        this.messageService.add({
            severity: 'success',
            summary: 'PDF Exported',
            detail: 'Professional Protocol PDF has been generated.',
        });
    }

    private formatSetsReps(ex: any): string {
        const sets = ex.sets || [];
        if (sets.length === 0) return '—';

        const first = sets[0];
        const allSame = sets.every((s: any) =>
            s.repetitions === first.repetitions &&
            s.intensity === first.intensity
        );

        const method = ex.intensityMethod ? `\n[${ex.intensityMethod}]` : '';

        if (allSame) {
            return `${sets.length}× ${first.repetitions} @ ${first.intensity || 'BW'}${method}`;
        } else {
            return sets.map((s: any, i: number) => `S${i + 1}: ${s.repetitions}r @ ${s.intensity || 'BW'}`).join('\n') + method;
        }
    }

    private formatTempo(ex: any): string {
        const first = ex.sets[0] || {};
        const tempo = first.tempo || '—';
        return `Tempo: ${tempo}\n${ex.intensityMethod || ''}`;
    }

}
