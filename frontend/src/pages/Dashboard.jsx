import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    apiFetch("/api/dashboard").then((d) => setData(d || { clients:0, projects:0, income:0, expense:0 }));
  }, []);

  useEffect(() => {
    if (!data) return;

    // Destroy old charts to avoid duplicates on hot reload
    if (barChartRef.current) barChartRef.current.destroy();
    if (pieChartRef.current) pieChartRef.current.destroy();

    // Bar: Income vs Expense
    barChartRef.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: ["Income", "Expense"],
        datasets: [{
          label: "IDR",
          data: [data.income || 0, data.expense || 0],
          backgroundColor: ["#1e40af", "#0ea5e9"], // biru tua/cerah
          borderColor: "#102040",
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: { color: "#e5e7eb" },
            grid: { color: "rgba(16,32,64,.35)" }
          },
          x: {
            ticks: { color: "#e5e7eb" },
            grid: { color: "rgba(16,32,64,.2)" }
          }
        },
        plugins: {
          legend: { labels: { color: "#e5e7eb" } },
          tooltip: {
            callbacks: {
              label: (ctx) => "Rp " + Number(ctx.parsed.y).toLocaleString("id-ID")
            }
          }
        }
      }
    });

    // Pie: Clients vs Projects
    pieChartRef.current = new Chart(pieRef.current, {
      type: "doughnut",
      data: {
        labels: ["Clients", "Projects"],
        datasets: [{
          data: [data.clients || 0, data.projects || 0],
          backgroundColor: ["#0ea5e9", "#1e3a8a"],
          borderColor: "#0b0b0b",
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#e5e7eb" } }
        },
        cutout: "60%"
      }
    });

    return () => {
      if (barChartRef.current) barChartRef.current.destroy();
      if (pieChartRef.current) pieChartRef.current.destroy();
    };
  }, [data]);

  if (!data) {
    return <div className="text-ink/70">Loading data...</div>;
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Clients" value={data.clients} />
        <KPI title="Projects" value={data.projects} />
        <KPI title="Income" value={"Rp " + Number(data.income).toLocaleString("id-ID")} />
        <KPI title="Expense" value={"Rp " + Number(data.expense).toLocaleString("id-ID")} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-edge/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Income vs Expense</h3>
            <span className="text-xs text-ink/60">Realtime</span>
          </div>
          <div className="h-72">
            <canvas ref={barRef} />
          </div>
        </div>

        <div className="bg-card border border-edge/40 rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Clients vs Projects</h3>
          <div className="h-72">
            <canvas ref={pieRef} />
          </div>
        </div>
      </div>
    </>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-card border border-edge/40 rounded-2xl p-4">
      <div className="text-sm text-ink/60">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="mt-3 h-2 bg-base rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-edge/70"></div>
      </div>
    </div>
  );
}
