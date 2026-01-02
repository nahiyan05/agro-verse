"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiEdit3,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiBarChart,
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { Dialog } from "@/components/ui/dialog";
import { EditCropRecordDialog } from "./EditCropRecordDialog";

export function CropRecordsSection({ landId, onRecordsChange }) {
  const [cropRecords, setCropRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCropRecords = async () => {
    try {
      const response = await fetch(`/api/crop-records?landId=${landId}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCropRecords(result.data);
        onRecordsChange?.(result.data);
      }
    } catch (error) {
      console.error("Error fetching crop records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (landId) {
      fetchCropRecords();
    }
  }, [landId]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this crop record?")) return;

    try {
      const response = await fetch(`/api/crop-records/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCropRecords((prev) => prev.filter((record) => record.id !== id));
      } else {
        alert(result.message || "Failed to delete crop record");
      }
    } catch (error) {
      console.error("Error deleting crop record:", error);
      alert("Failed to delete crop record");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    fetchCropRecords();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
  };

  // Get available years
  const availableYears = [
    ...new Set(cropRecords.map((record) => record.year)),
  ].sort((a, b) => b - a);

  // Filter records by selected year
  const yearRecords = cropRecords.filter(
    (record) => record.year === selectedYear
  );

  // Prepare chart data for the selected year
  const chartData = ["Winter", "Spring", "Summer", "Monsoon"].map((season) => {
    const seasonRecord = yearRecords.find((record) => record.season === season);
    return {
      season,
      expenses: seasonRecord?.total_expenses || 0,
      revenue: seasonRecord?.total_revenue || 0,
      yield: seasonRecord?.total_yield || 0,
      profit:
        (seasonRecord?.total_revenue || 0) -
        (seasonRecord?.total_expenses || 0),
      crop: seasonRecord?.crop_name || null,
    };
  });

  // Calculate yearly totals - fix the calculations
  const yearlyTotals = yearRecords.reduce(
    (acc, record) => {
      const expenses = parseFloat(record.total_expenses) || 0;
      const revenue = parseFloat(record.total_revenue) || 0;
      const yieldVal = parseFloat(record.total_yield) || 0;
      const profit = revenue - expenses;

      return {
        expenses: acc.expenses + expenses,
        revenue: acc.revenue + revenue,
        yield: acc.yield + yieldVal,
        profit: acc.profit + profit,
      };
    },
    { expenses: 0, revenue: 0, yield: 0, profit: 0 }
  );

  const getSeasonIcon = (season) => {
    const icons = {
      Winter: "❄️",
      Spring: "🌸",
      Summer: "☀️",
      Monsoon: "🌧️",
    };
    return icons[season] || "🌱";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "৳0";
    return `৳${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics and Charts */}
      {availableYears.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Crop Statistics
            </h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
                  <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(yearlyTotals.expenses)} ৳
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                  <FiTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(yearlyTotals.revenue)} ৳
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <FiDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Net Profit
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      yearlyTotals.profit >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(yearlyTotals.profit)} ৳
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
                  <GiWheat className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Yield
                  </p>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {yearlyTotals.yield.toLocaleString()} Kg
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Seasonal Performance ({selectedYear})
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(156, 163, 175, 0.3)"
                  />
                  <XAxis
                    dataKey="season"
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="money"
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="yield"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                    formatter={(value, name) => {
                      if (name === "yield")
                        return [`${value.toLocaleString()}`, "Yield"];
                      if (name === "profit")
                        return [formatCurrency(value), "Profit"];
                      return [
                        formatCurrency(value),
                        name === "expenses" ? "Expenses" : "Revenue",
                      ];
                    }}
                    labelFormatter={(label) => `Season: ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px", fontWeight: 500 }}
                  />
                  <Bar
                    yAxisId="money"
                    dataKey="expenses"
                    fill="#ef4444"
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    yAxisId="money"
                    dataKey="revenue"
                    fill="#10b981"
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    yAxisId="yield"
                    dataKey="yield"
                    fill="#f59e0b"
                    name="Yield"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Crop Records List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiBarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Crop Records
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {cropRecords.length} record{cropRecords.length !== 1 ? "s" : ""}{" "}
                total
              </p>
            </div>
          </div>
        </div>

        {cropRecords.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center">
              <GiWheat className="h-12 w-12 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No crop records yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start tracking your farming journey by adding your first crop
              record. Monitor yields, expenses, and profits across seasons.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {cropRecords.map((record, index) => (
              <div
                key={record.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="relative z-10">

                            <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl">
                              <span className="text-3xl">
                                {getSeasonIcon(record.season)}
                              </span>
                              </div>
                              <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {record.crop_name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FiCalendar className="h-4 w-4" />
                                <span className="font-medium">
                                {record.season} {record.year}
                                </span>
                              </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                              onClick={() => handleEdit(record)}
                              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit record"
                              >
                              <FiEdit3 className="h-4 w-4" />
                              </button>
                              <button
                              onClick={() => handleDelete(record.id)}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete record"
                              >
                              <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                            </div>

                            {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Planted
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatDate(record.planting_date)}
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Harvested
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatDate(record.harvest_date)}
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Yield
                      </p>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm">
                        {record.total_yield
                          ? `${record.total_yield} ${record.yield_unit}`
                          : "Not recorded"}
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Expenses
                      </p>
                      <p className="font-semibold text-red-600 dark:text-red-400 text-sm">
                        {record.total_expenses
                          ? formatCurrency(record.total_expenses)
                          : "৳0"}
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Revenue
                      </p>
                      <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        {record.total_revenue
                          ? formatCurrency(record.total_revenue)
                          : "৳0"}
                      </p>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Profit
                      </p>
                      <div className="flex items-center gap-1">
                        {(record.total_revenue || 0) -
                          (record.total_expenses || 0) >=
                        0 ? (
                          <FiTrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <FiTrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <p
                          className={`font-semibold text-sm ${
                            (record.total_revenue || 0) -
                              (record.total_expenses || 0) >=
                            0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(
                            (record.total_revenue || 0) -
                              (record.total_expenses || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {record.notes && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded-full mt-0.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
                            Notes
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {record.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <EditCropRecordDialog
          record={editingRecord}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </Dialog>
    </div>
  );
}
