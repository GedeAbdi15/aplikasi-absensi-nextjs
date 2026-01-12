"use client";

import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  TimePicker,
} from "antd";
import { useEffect, useState } from "react";

const BerandaClient = () => {
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [jam, setJam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [JamKerjaOption, setJamKerjaOption] = useState([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDivisi = async () => {
    const res = await fetch("/api/jam-kerja");
    const data = await res.json();

    if (data.success === false) {
      message.error("Gagal mengambil data jam kerja");
      return;
    }

    setJamKerjaOption(
      data.data.map((j) => ({
        label: j.nama_jam,
        value: j.id_jam,
      }))
    );
  };

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

        if (pegawaiJson.success && isMounted) {
          setPegawai(pegawaiJson.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadDataJam = async () => {
      await fetchDivisi();
    };

    fetchData();
    loadDataJam();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAbsenMasuk = async (values) => {
    setBtnLoading(true);

    try {
      const payload = {
        tgl_absensi: new Date().toISOString(),
        jam_masuk: new Date().toISOString(),
        status: "hadir",
        id_jam: values.id_jam,
      };

      console.log("Absen masuk payload:", payload);

      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal absen masuk");
      }

      console.log("Absen masuk sukses:", json);
      message.success("Absen masuk berhasil");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleAbsenPulang = async () => {
    try {
      const res = await fetch("/api/absensi/pulang", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jam_pulang: new Date().toISOString(),
          status: "hadir",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal absen pulang");
      }

      console.log("Absen pulang sukses:", json);
      message.success("Berhasil absen pulang");
    } catch (err) {
      console.error(err.message);
    }
  };

  const showModalAdd = (record) => {
    setJam(record);
    form.resetFields();
    setIsModalOpen(true);
  };

  return (
    <>
      <Modal
        title={"Pilih Jam Kerja"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAbsenMasuk}>
          <Form.Item
            name="id_jam"
            label="Jam Kerja"
            rules={[{ required: true, message: "Jam kerja wajib dipilih" }]}
          >
            <Select options={JamKerjaOption} />
          </Form.Item>
        </Form>
      </Modal>

      <div className="">
        <Flex justify="center" align="center" direction="row" gap="middle">
          <Button
            loading={btnLoading}
            disabled={role !== "pegawai"}
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={showModalAdd}
          >
            Absen Masuk
          </Button>

          <Button
            loading={btnLoading}
            disabled={role !== "pegawai"}
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={handleAbsenPulang}
          >
            Absen Pulang
          </Button>
        </Flex>

        <Card
          title="Informasi Pengguna"
          variant="borderless"
          style={{ width: 300 }}
          loading={loading}
        >
          <div className="">
            <p>Nama Pegawai : {pegawai?.nama_lengkap}</p>
            <p>NIP : {pegawai?.nip}</p>
            <p>Jenis Kelamin : {pegawai?.jenis_kelamin}</p>
            <p>Jabatan : {pegawai?.jabatan}</p>
            <p>Divisi : {pegawai?.divisi?.nama_divisi}</p>
            <p>No Telepon : {pegawai?.no_telepon}</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default BerandaClient;
