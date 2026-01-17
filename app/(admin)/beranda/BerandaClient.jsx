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
  DatePicker,
} from "antd";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

const BerandaClient = () => {
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [jam, setJam] = useState(null);
  const [izin, setIzin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [JamKerjaOption, setJamKerjaOption] = useState([]);
  const [form] = Form.useForm();
  const [isModalAbsenOpen, setIsModalAbsenOpen] = useState(false);
  const [isModalIzinOpen, setIsModalIzinOpen] = useState(false);

  const fetchDataJamKerja = async () => {
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
      await fetchDataJamKerja();
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
      setIsModalAbsenOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleIzin = async (values) => {
    setBtnLoading(true);

    try {
      const [tglMulai, tglSelesai] = values.tgl_izin;

      const payload = {
        tgl_mulai: tglMulai.toISOString(),
        tgl_selesai: tglSelesai.toISOString(),
        alasan: values.alasan,
      };

      console.log("Payload izin:", payload);

      const res = await fetch("/api/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal input izin");

      message.success("Izin berhasil");
      setIsModalIzinOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err.message);
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
    setIsModalAbsenOpen(true);
  };

  const showModalIzin = (record) => {
    setIzin(record);
    form.resetFields();
    setIsModalIzinOpen(true);
  };

  return (
    <>
      <Modal
        title={"Pilih Jam Kerja"}
        open={isModalAbsenOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalAbsenOpen(false)}
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

      <Modal
        title={"Input Izin"}
        open={isModalIzinOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalIzinOpen(false)}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleIzin}>
          <Form.Item
            name="alasan"
            label="Alasan"
            rules={[{ required: true, message: "Alasan wajib diisi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tgl_izin"
            label="Tanggal Izin"
            rules={[{ required: true, message: "Tanggal izin wajib diisi" }]}
          >
            <RangePicker />
          </Form.Item>
        </Form>
      </Modal>

      <div className="">
        {role === "pegawai" && (
          <Flex justify="center" align="center" direction="row" gap="middle">
            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={showModalAdd}
            >
              Absen Masuk
            </Button>

            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={handleAbsenPulang}
            >
              Absen Pulang
            </Button>

            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={showModalIzin}
            >
              Input Izin
            </Button>
          </Flex>
        )}

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
