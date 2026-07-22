import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Ticket, Plus, Clock, CheckCircle, AlertCircle,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";

export default function BranchDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.branchStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  const statusData = stats?.statusBreakdown
    ?.filter(s => s.count > 0)
    .map(s => ({ name: s.name, value: s.count, color: s.color })) || [];

  const totalTickets = stats?.totalTickets || 0;
  const openCount = stats?.statusBreakdown?.find(s => s.name === "Open")?.count || 0;
  const inProgressCount = stats?.statusBreakdown?.find(s => s.name === "In Progress")?.count || 0;
  const solvedCount = stats?.statusBreakdown?.find(s => s.name === "Solved")?.count || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Welcome back, {user?.type === "branch" ? user.branchName : "Branch"}
            </h2>
            <p className="text-red-100 mt-1 text-sm">
              Here&apos;s what&apos;s happening with your tickets
            </p>
          </div>
          <button
            onClick={() => navigate("/tickets/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: totalTickets, icon: Ticket, color: "bg-blue-50 text-blue-600" },
          { label: "Open", value: openCount, icon: AlertCircle, color: "bg-red-50 text-red-600" },
          { label: "In Progress", value: inProgressCount, icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Solved", value: solvedCount, icon: CheckCircle, color: "bg-green-50 text-green-600" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Status Breakdown</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-gray-600">{s.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No tickets yet
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {stats?.recentActivity?.slice(0, 6).map((activity, idx) => (
              <div key={activity.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="relative flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  {idx < 5 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.createdAt ?? new Date()).toLocaleDateString()} at{" "}
                    {new Date(activity.createdAt ?? new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )) || (
              <div className="py-8 text-center text-gray-400 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">My Recent Tickets</h3>
          <button
            onClick={() => navigate("/tickets")}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTickets?.slice(0, 5).map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <td className="py-3 px-4 text-sm font-mono text-red-600">{ticket.ticketNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate max-w-[200px]">{ticket.subject}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {ticket.statusId ? "Active" : "New"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt ?? new Date()).toLocaleDateString()}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                    No tickets yet. <button onClick={() => navigate("/tickets/new")} className="text-red-600 hover:underline">Create one</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
