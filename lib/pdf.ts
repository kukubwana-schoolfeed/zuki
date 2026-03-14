import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatZMW } from '@/lib/utils'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFAF8' },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#F4A7B9', paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#2D2D2D', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#8A8A8A' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#2D2D2D', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0E8E8', paddingBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 10, color: '#8A8A8A' },
  value: { fontSize: 10, color: '#2D2D2D', fontFamily: 'Helvetica-Bold' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#FDE8EE', padding: 12, borderRadius: 8 },
  statValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#E07A93' },
  statLabel: { fontSize: 9, color: '#8A8A8A', marginTop: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F4A7B9', padding: 8, marginBottom: 2 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#F0E8E8' },
  tableCell: { fontSize: 9, color: '#2D2D2D', flex: 1 },
  tableCellHeader: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'white', flex: 1 },
  highlight: { backgroundColor: '#FDE8EE', padding: 10, borderRadius: 6, marginBottom: 6 },
  highlightText: { fontSize: 10, color: '#2D2D2D' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#8A8A8A', fontSize: 9 },
  pink: { color: '#E07A93' },
})

interface SalesReportProps {
  bakeryName: string
  period: string
  report: {
    summary: { totalOrders: number; totalRevenue: number; averageOrderValue: number; completedOrders: number; cancelledOrders: number }
    topItems: { name: string; count: number; revenue: number }[]
    highlights: string[]
    recommendations: string[]
  }
  orders: any[]
}

export function SalesReportDocument({ bakeryName, period, report, orders }: SalesReportProps) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, bakeryName),
        React.createElement(Text, { style: styles.subtitle }, `Sales Report • ${period}`),
        React.createElement(Text, { style: { ...styles.subtitle, marginTop: 4 } },
          `Generated ${format(new Date(), 'dd MMMM yyyy')} by Zuki AI`)
      ),

      // Stats
      React.createElement(View, { style: styles.statsGrid },
        ...[
          { value: report.summary.totalOrders.toString(), label: 'Total Orders' },
          { value: formatZMW(report.summary.totalRevenue), label: 'Total Revenue' },
          { value: formatZMW(report.summary.averageOrderValue), label: 'Avg Order Value' },
          { value: report.summary.completedOrders.toString(), label: 'Completed' },
        ].map(stat =>
          React.createElement(View, { style: styles.statBox, key: stat.label },
            React.createElement(Text, { style: styles.statValue }, stat.value),
            React.createElement(Text, { style: styles.statLabel }, stat.label)
          )
        )
      ),

      // Top items
      report.topItems?.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top Items'),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: styles.tableCellHeader }, 'Item'),
          React.createElement(Text, { style: styles.tableCellHeader }, 'Orders'),
          React.createElement(Text, { style: styles.tableCellHeader }, 'Revenue'),
        ),
        ...report.topItems.map(item =>
          React.createElement(View, { style: styles.tableRow, key: item.name },
            React.createElement(Text, { style: styles.tableCell }, item.name),
            React.createElement(Text, { style: styles.tableCell }, item.count.toString()),
            React.createElement(Text, { style: styles.tableCell }, formatZMW(item.revenue)),
          )
        )
      ),

      // Insights
      report.highlights?.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'AI Insights'),
        ...report.highlights.map((h, i) =>
          React.createElement(View, { style: styles.highlight, key: i },
            React.createElement(Text, { style: styles.highlightText }, `• ${h}`)
          )
        )
      ),

      // Footer
      React.createElement(Text, { style: styles.footer }, 'Generated by Zuki • Every cake, perfectly placed.')
    )
  )
}
