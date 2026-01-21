"use client";

import { message, Space, Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const IzinClient = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // 1. ambil user login
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();

        if (!meJson.success || !isMounted) return;

        setRole(meJson.data.role);

        // 2. ambil data pegawai berdasarkan nip
        const pegawaiRes = await fetch(`/api/pegawai/${meJson.data.nip}`);
        const pegawaiJson = await pegawaiRes.json();

        console.log("PEGAWAI JSON:", pegawaiJson);

        if (pegawaiJson.success && isMounted) {
          setPegawai(pegawaiJson.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!role) return;
    if (role !== "admin" && !pegawai) return;

    const fetchDataAbsensi = async () => {
      setLoading(true);
      try {
        let res;

        if (role === "admin") {
          res = await fetch("/api/izin");
        } else {
          res = await fetch(`/api/izin/pegawai/${pegawai?.id_pegawai}`);
        }

        const json = await res.json();
        setTableData(json.data || []);
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAbsensi();
  }, [role, pegawai]);

  const handleSetStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_izin: newStatus }),
      });

      const json = await res.json();

      if (res.ok) {
        const updated = json?.data;

        if (!updated?.id_izin) {
          message.error("Response update tidak valid");
          return;
        }

        message.success("Status izin berhasil diperbarui");
        setTableData((prev) =>
          prev.map((item) =>
            item?.id_izin === updated.id_izin ? updated : item,
          ),
        );
      } else {
        message.error(json?.message || "Failed to update status");
      }
    } catch (err) {
      message.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Nama Pegawai",
      dataIndex: ["pegawai", "nama_lengkap"],
      key: "nama_lengkap",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tgl_mulai",
      key: "tgl_mulai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Tanggal Selesai",
      dataIndex: "tgl_selesai",
      key: "tgl_selesai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Alasan",
      key: "alasan",
      dataIndex: "alasan",
    },
    {
      title: "Status Izin",
      key: "status_izin",
      dataIndex: "status_izin",
    },
    ...(role === "admin"
      ? [
          {
            title: "Dokument Bukti Izin",
            key: "filepath",
            render: (_, record) => {
              if (!record.filepath) return "-";

              const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${record.filepath}`;

              return (
                <Space size="middle">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    Lihat Dokumen
                  </a>
                </Space>
              );
            },
          },
        ]
      : []),
    ...(role === "admin"
      ? [
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Space size="middle">
                <a onClick={() => handleSetStatus(record.id_izin, "disetujui")}>
                  Setujui
                </a>
                <a onClick={() => handleSetStatus(record.id_izin, "ditolak")}>
                  Tolak
                </a>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <h1 className="mb-5">Data Izin</h1>

      <Table
        columns={columns}
        rowKey={(row) => row.id_izin}
        loading={loading}
        dataSource={tableData}
      />
    </>
  );
};

export default IzinClient;
