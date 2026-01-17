"use client";

import { message, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const AbsenClient = () => {
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
          res = await fetch("/api/absensi");
        } else {
          res = await fetch(`/api/absensi/pegawai/${pegawai?.id_pegawai}`);
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

  const columns = [
    {
      title: "Nama Pegawai",
      dataIndex: ["pegawai", "nama_lengkap"],
      key: "nama_lengkap",
    },
    {
      title: "Tanggal Absensi",
      dataIndex: "tgl_absensi",
      key: "tgl_absensi",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Jam Masuk",
      dataIndex: "jam_masuk",
      key: "jam_masuk",
    },
    {
      title: "Jam Pulang",
      dataIndex: "jam_pulang",
      key: "jam_pulang",
    },
  ];

  return (
    <>
      <div className="">
        <h1>Data Absensi</h1>
      </div>
      <Table
        columns={columns}
        rowKey={(row) => row.id_absensi}
        dataSource={tableData}
        loading={loading}
      />
    </>
  );
};

export default AbsenClient;
