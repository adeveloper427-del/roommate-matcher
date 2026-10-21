import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Booking, Organization, Property } from '../types';

const BOOKING_STATUSES: Booking['status'][] = ['pending', 'approved', 'rejected', 'cancelled'];

interface ReportData {
  userCount: number;
  organizations: Organization[];
  verifiedRate: number;
  properties: Property[];
  bookings: Booking[];
  topProperties: Property[];
}

function buildReportHtml(data: ReportData): string {
  const { userCount, organizations, verifiedRate, properties, bookings, topProperties } = data;
  const totalBookings = bookings.length;
  const generatedAt = new Date().toLocaleString();

  const statusRows = BOOKING_STATUSES.map((status) => {
    const count = bookings.filter((b) => b.status === status).length;
    const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
    return `
      <tr>
        <td style="text-transform:capitalize">${status}</td>
        <td>${count}</td>
        <td>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </td>
        <td>${pct}%</td>
      </tr>`;
  }).join('');

  const propertyRows = topProperties
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.location}</td>
        <td>${p.rating.toFixed(1)}★ (${p.reviewCount} reviews)</td>
      </tr>`
    )
    .join('');

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          color: #3A2A1B;
          margin: 0;
          padding: 40px;
          background: #FDF7F1;
        }
        .header {
          background: linear-gradient(135deg, #F3A65A, #C1793D 50%, #8C5423);
          color: #FFFFFF;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 32px;
        }
        .header h1 { margin: 0 0 4px; font-size: 26px; }
        .header p { margin: 0; opacity: 0.9; font-size: 13px; }
        .stats {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          flex: 1;
          background: #FBEADA;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .stat-card .value { font-size: 28px; font-weight: 700; color: #8C5423; }
        .stat-card .label { font-size: 12px; color: #7A4B23; margin-top: 4px; }
        h2 {
          font-size: 16px;
          border-bottom: 2px solid #EFDFCB;
          padding-bottom: 8px;
          margin-top: 32px;
        }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #EFDFCB; }
        th { color: #8A6E56; font-weight: 600; font-size: 11px; text-transform: uppercase; }
        .bar-track { background: #EFDFCB; border-radius: 999px; height: 6px; width: 120px; overflow: hidden; }
        .bar-fill { background: #C1793D; height: 100%; border-radius: 999px; }
        .footer { margin-top: 40px; font-size: 11px; color: #B8A38C; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Roommate Matcher — Platform Report</h1>
        <p>Generated ${generatedAt}</p>
      </div>

      <div class="stats">
        <div class="stat-card"><div class="value">${userCount}</div><div class="label">Total Users</div></div>
        <div class="stat-card"><div class="value">${organizations.length}</div><div class="label">Organizations</div></div>
        <div class="stat-card"><div class="value">${verifiedRate}%</div><div class="label">Verified Orgs</div></div>
        <div class="stat-card"><div class="value">${properties.length}</div><div class="label">Properties</div></div>
        <div class="stat-card"><div class="value">${totalBookings}</div><div class="label">Total Bookings</div></div>
      </div>

      <h2>Bookings by Status</h2>
      <table>
        <thead><tr><th>Status</th><th>Count</th><th>Share</th><th></th></tr></thead>
        <tbody>${statusRows}</tbody>
      </table>

      <h2>Top Rated Properties</h2>
      <table>
        <thead><tr><th>Property</th><th>Location</th><th>Rating</th></tr></thead>
        <tbody>${propertyRows || '<tr><td colspan="3">No properties yet.</td></tr>'}</tbody>
      </table>

      <div class="footer">Roommate Matcher · Admin Report</div>
    </body>
  </html>`;
}

/**
 * Builds a formatted PDF report and hands it to the OS share/save sheet
 * (native) or opens it in a new tab for download (web).
 */
export async function exportPlatformReport(data: ReportData): Promise<void> {
  const html = buildReportHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (Platform.OS === 'web') {
    window.open(uri, '_blank');
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Roommate Matcher Report',
      UTI: 'com.adobe.pdf',
    });
  }
}
