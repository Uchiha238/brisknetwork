import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { ShoppingCart, Users, UserCheck, LayoutGrid, MoreHorizontal, Settings, Package } from 'lucide-react';
import { api } from '../../services/api';

const sparklineData = [
  { value: 40 }, { value: 60 }, { value: 45 }, { value: 70 }, 
  { value: 55 }, { value: 80 }, { value: 65 }, { value: 90 },
  { value: 75 }, { value: 85 }, { value: 70 }, { value: 95 }
];

const countryData = [
  { name: 'France', value: 580 },
  { name: 'Italy', value: 540 },
  { name: 'Netherlands', value: 470 },
  { name: 'United Kingdom', value: 450 },
  { name: 'Canada', value: 440 },
  { name: 'South Korea', value: 420 },
];

const monthlyData = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 65 },
  { month: 'Mar', value: 45 },
  { month: 'Apr', value: 90 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 80 },
  { month: 'Jul', value: 30 },
];

const pieDataDefault = [
  { name: 'Booked', value: 1 },
  { name: 'In Transit', value: 1 },
  { name: 'Delivered', value: 1 },
];

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalShipments: 0,
    statusDistribution: []
  });
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    api.getDashboardStats()
      .then(data => {
        // Guard against non-object or error responses from the backend
        if (data && typeof data === 'object' && !data.error) {
          setStats({
            totalCustomers: data.totalCustomers ?? 0,
            totalShipments: data.totalShipments ?? 0,
            statusDistribution: Array.isArray(data.statusDistribution) ? data.statusDistribution : []
          });
        } else {
          setBackendError(true);
        }
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setBackendError(true);
      });
  }, []);

  const pieData = (stats.statusDistribution && stats.statusDistribution.length > 0)
    ? stats.statusDistribution.map(s => ({ name: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' ') : 'Unknown', value: s.count ?? 0 }))
    : pieDataDefault;

  const totalStatusCount = pieData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-[#f8fafc] min-h-full">
      {backendError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cannot connect to backend server. Stats may be unavailable.
          </span>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-3 border-b border-slate-100 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-extrabold">Dashboard</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Dashboard</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Welcome to OM Courier Admin Portal</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Shipments Card (Replaces Total Company) */}
        <div className="bg-[#1e3a8a] rounded-xl shadow-sm overflow-hidden flex flex-col h-40 group hover:shadow-lg transition-all">
          <div className="p-5 flex justify-between items-start">
            <div className="text-white">
              <div className="text-3xl font-bold mb-1">{stats.totalShipments}</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-80">Total Shipments</div>
            </div>
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-auto h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total User Card (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-40 hover:shadow-lg transition-all">
          <div className="p-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-800">1</span>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Users</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-auto h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Customer Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-40 hover:shadow-lg transition-all">
          <div className="p-5 flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalCustomers}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Customer</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-auto h-16 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Branch Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-40 hover:shadow-lg transition-all">
          <div className="p-5 flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-1">1</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Branches</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <LayoutGrid className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-auto h-16 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row - Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Country Bar Chart (takes 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Top Countries by Shipment</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={countryData}
                margin={{ left: 40, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#334155" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart (takes 1 column) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Shipment Status Distribution</h3>
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[80px]">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-800">{item.value} ({Math.round((item.value/totalStatusCount)*100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Shipment Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Monthly Shipment</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis hide />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Report Column View */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Cash Report</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-lg flex flex-col items-center justify-center border border-blue-100">
               <span className="text-blue-600 font-bold text-xl mb-1">International</span>
               <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
                 <div className="bg-blue-600 h-full w-2/3"></div>
               </div>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-lg flex flex-col items-center justify-center border border-emerald-100">
               <span className="text-emerald-600 font-bold text-xl mb-1">Domestic</span>
               <div className="w-full h-1 bg-emerald-200 rounded-full overflow-hidden">
                 <div className="bg-emerald-600 h-full w-1/2"></div>
               </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
