const PDFDocument = require('pdfkit');
const Species = require('../models/Species');
const MonitoringSite = require('../models/MonitoringSite');
const Sighting = require('../models/Sighting');

exports.downloadReport = async (req, res) => {
  try {
    const speciesList = await Species.find();
    const sitesList = await MonitoringSite.find();
    const sightingsList = await Sighting.find().populate('species monitoringSite observedBy');

    // --- Real computed metrics ---
    const totalSightings = sightingsList.length;
    const totalIndividuals = sightingsList.reduce((sum, s) => sum + (s.individualCount || 1), 0);
    const activeSpecies = speciesList.length;
    const statusCounts = speciesList.reduce((acc, sp) => {
      acc[sp.conservationStatus] = (acc[sp.conservationStatus] || 0) + 1;
      return acc;
    }, {});

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const pad = n => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `wildlife-monitoring-report-${ts}.pdf`;

    const alertSpecies = speciesList.filter(sp =>
      ['Critical', 'Vulnerable'].includes(sp.conservationStatus)
    );

    const recommendations = [];
    speciesList.forEach(sp => {
      const spSightings = sightingsList.filter(s => s.species?._id?.toString() === sp._id.toString());
      const thisMonth = spSightings.filter(s => new Date(s.eventDate) >= startOfThisMonth).length;
      const lastMonth = spSightings.filter(s => new Date(s.eventDate) >= startOfLastMonth && new Date(s.eventDate) < startOfThisMonth).length;

      if (sp.conservationStatus === 'Critical') {
        recommendations.push(`[HIGH] ${sp.commonName}: Increase patrol/monitoring frequency (Critical status).`);
      }
      if (['Critical', 'Vulnerable'].includes(sp.conservationStatus) && lastMonth > 0 && thisMonth < lastMonth) {
        recommendations.push(`[HIGH] ${sp.commonName}: Sightings declined from ${lastMonth} to ${thisMonth} this month — investigate cause.`);
      }
      if (['Critical', 'Vulnerable'].includes(sp.conservationStatus) && spSightings.length <= 1) {
        recommendations.push(`[MEDIUM] ${sp.commonName}: Limited data (${spSightings.length} sighting) despite elevated risk — expand coverage.`);
      }
    });

    const recentSightings = [...sightingsList]
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
      .slice(0, 8);

    // --- Build the PDF ---
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const FOREST_GREEN = '#1f4d3d';
    const MUTED = '#6b7280';
    const ALERT_RED = '#b91c1c';
    const PAGE_BOTTOM = () => doc.page.height - doc.page.margins.bottom;

    // Manual space-check helper — avoids pdfkit's auto page-break guesswork
    // that was causing stray trailing blank pages.
    function ensureSpace(neededHeight) {
      if (doc.y + neededHeight > PAGE_BOTTOM()) {
        doc.addPage();
      }
    }

    // ===== PAGE 1: COVER =====
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f5f7f4');
    doc.fillColor(FOREST_GREEN).fontSize(12).font('Helvetica-Bold')
      .text('WILDLIFE INTELLIGENCE SYSTEM', 50, 80);

    doc.fillColor('#111827').fontSize(30).font('Helvetica-Bold')
      .text('WILDLIFE MONITORING REPORT', 50, 200, { width: 480 });

    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fontSize(13).fillColor(MUTED).font('Helvetica')
      .text(`Generated on ${formattedDate}`, 50, 280);

    const reporterName = req.user?.name || req.user?.fullName || req.user?.email || 'Unknown Researcher';
    doc.fontSize(12).fillColor('#111827').font('Helvetica-Bold')
      .text(`Reported By ${reporterName}`, 50, 305);

    doc.fontSize(11).fillColor(MUTED).font('Helvetica')
      .text(`Covering ${sitesList.length} monitoring site(s), ${activeSpecies} tracked species, and ${totalSightings} field-verified sightings.`, 50, 420, { width: 480 });

    // ===== PAGE 2+: REPORT CONTENT =====
    doc.addPage();

    // -- Summary Metrics --
    ensureSpace(90);
    doc.fillColor(FOREST_GREEN).fontSize(18).font('Helvetica-Bold').text('Summary Metrics');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(11).font('Helvetica');
    doc.text(`Total Sightings: ${totalSightings}    Total Individuals Observed: ${totalIndividuals}`);
    doc.text(`Active Species Tracked: ${activeSpecies}    Monitoring Sites: ${sitesList.length}`);
    doc.text(`Conservation Status Breakdown: Critical ${statusCounts['Critical'] || 0}, Vulnerable ${statusCounts['Vulnerable'] || 0}, Healthy ${statusCounts['Healthy'] || 0}`);
    doc.moveDown(1.5);

    // -- Active Conservation Alerts --
    ensureSpace(60);
    doc.fillColor(ALERT_RED).fontSize(18).font('Helvetica-Bold').text('Active Conservation Alerts');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(10).font('Helvetica');
    if (alertSpecies.length === 0) {
      ensureSpace(20);
      doc.text('No species currently flagged as Critical or Vulnerable.');
    } else {
      alertSpecies.forEach(sp => {
        const spSightings = sightingsList
          .filter(s => s.species?._id?.toString() === sp._id.toString())
          .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        const lastSeen = spSightings[0]
          ? new Date(spSightings[0].eventDate).toLocaleDateString()
          : 'No recorded sightings';
        const lastSite = spSightings[0]?.monitoringSite?.siteName || 'N/A';

        ensureSpace(30);
        doc.font('Helvetica-Bold').text(`⚠ ${sp.commonName} — ${sp.conservationStatus}`, { width: 480 });
        doc.font('Helvetica').text(`   Last recorded: ${lastSeen} at ${lastSite}`, { width: 480 });
      });
    }
    doc.moveDown(1.5);

    // -- Conservation Recommendations --
    ensureSpace(60);
    doc.fillColor(FOREST_GREEN).fontSize(18).font('Helvetica-Bold').text('Conservation Recommendations');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(10).font('Helvetica');
    if (recommendations.length === 0) {
      ensureSpace(20);
      doc.text('No urgent recommendations at this time — no high-risk conditions detected in current data.');
    } else {
      recommendations.forEach(r => {
        ensureSpace(20);
        doc.text(`• ${r}`, { width: 480 });
      });
    }
    doc.moveDown(1.5);

    // -- Recent Field Sightings --
    ensureSpace(60);
    doc.fillColor(FOREST_GREEN).fontSize(18).font('Helvetica-Bold').text('Recent Field Sightings');
    doc.moveDown(0.5);
    doc.fillColor('#111827').fontSize(10).font('Helvetica');
    recentSightings.forEach(s => {
      ensureSpace(20);
      const dateStr = new Date(s.eventDate).toLocaleDateString();
      doc.text(`${dateStr} — ${s.species?.commonName || 'Unknown'} at ${s.monitoringSite?.siteName || 'Unknown site'} (${s.individualCount || 1} individual(s), ${((s.classifierConfidence || 0) * 100).toFixed(0)}% AI confidence)`);
    });
    doc.moveDown(1.5);

    // -- Footer disclaimer --
    ensureSpace(40);
    doc.fillColor(MUTED).fontSize(8).font('Helvetica')
      .text('Generated from collected data recorded in the Wildlife Population Intelligence System. Recommendations are rule-based and derived from observed sighting patterns and conservation status data.', { width: 480 });

    // ===== Page numbers on every page =====
    const range = doc.bufferedPageRange();
    const originalBottomMargin = doc.page.margins.bottom;

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0;
      doc.fillColor(MUTED).fontSize(8).font('Helvetica').text(
        `Page ${i + 1 - range.start} of ${range.count}`,
        50,
        doc.page.height - 40,
        { width: doc.page.width - 100, align: 'center', lineBreak: false }
      );
    }
    doc.page.margins.bottom = originalBottomMargin;

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};