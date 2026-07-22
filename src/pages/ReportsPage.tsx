import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Download, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showReport, setShowReport] = useState(false);

  const { data: report } = trpc.report.generate.useQuery(
    { dateFrom: dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0], dateTo: dateTo || new Date().toISOString().split("T")[0] },
    { enabled: showReport }
  );

  const generate = () => setShowReport(true);

  const statusData = report?.byStatus?.map(s => ({ name: s.status, value: s.count, color: s.color })) || [];
  const priorityData = report?.byPriority?.map(p => ({ name: p.priority, value: p.count, color: p.color })) || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export ticket reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={generate} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" /> Generate
            </button>
          </div>
        </div>
      </div>

      {showReport && report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Tickets", value: report.summary.totalTickets, color: "bg-blue-50 text-blue-600" },
              { label: "Date Range", value: `${new Date(report.summary.dateRange.from).toLocaleDateString()} - ${new Date(report.summary.dateRange.to).toLocaleDateString()}`, color: "bg-gray-50 text-gray-600" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <p className="text-2xl font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                <p className="text-xs opacity-75">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">By Status</h3>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">By Priority</h3>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>
          </div>

          {/* Branch & Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">By Branch</h3>
              {report.byBranch.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={report.byBranch} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="branch" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#DC2626" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">By Category</h3>
              {report.byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={report.byCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
            </div>
          </div>

          {/* Ticket List */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Ticket Details ({report.tickets.length})</h3>
              <button onClick={() => {
                const csv = ["Ticket Number,Subject,Status,Priority,Created"];
                report.tickets.forEach(t => csv.push(`${t.ticketNumber},"${t.subject}",${t.statusId || ""},${t.priorityId || ""},${new Date(t.createdAt ?? new Date()).toLocaleDateString()}`));
                const blob = new Blob([csv.join("\n")], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `report-${report.summary.dateRange.from}.csv`; a.click();
              }} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {report.tickets.slice(0, 50).map(t => (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2 px-4 text-sm font-mono text-red-600">{t.ticketNumber}</td>
                      <td className="py-2 px-4 text-sm text-gray-800">{t.subject}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{new Date(t.createdAt ?? new Date()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.tickets.length > 50 && <p className="text-center text-xs text-gray-400 py-3">Showing first 50 of {report.tickets.length} tickets</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
