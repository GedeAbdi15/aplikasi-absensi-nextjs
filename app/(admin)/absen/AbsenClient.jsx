"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const AbsenClient = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const getColumnSearchProps = (dataIndexPath) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Cari`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndexPath.join("."));
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndexPath.join("."));
            }}
            icon={<SearchOutlined />}
            size="small"
          >
            Cari
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSearchText("");
            }}
            size="small"
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const fieldValue = dataIndexPath.reduce((obj, key) => obj?.[key], record);

      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

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
      ...getColumnSearchProps(["pegawai", "nama_lengkap"]),
    },
    {
      title: "Tanggal Absensi",
      dataIndex: "tgl_absensi",
      key: "tgl_absensi",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "Belum absen"),
    },
    {
      title: "Jam Masuk",
      dataIndex: "jam_masuk",
      key: "jam_masuk",
      render: (val) =>
        val ? dayjs(val).format("HH:mm:ss") : "Belum absen masuk",
    },
    {
      title: "Jam Pulang",
      dataIndex: "jam_pulang",
      key: "jam_pulang",
      render: (val) =>
        val ? dayjs(val).format("HH:mm:ss") : "Belum absen pulang",
    },
  ];

  return (
    <>
      <div className="mb-4">
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
