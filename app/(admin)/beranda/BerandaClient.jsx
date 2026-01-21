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
  Descriptions,
  Skeleton,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const normFile = (e) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const BerandaClient = () => {
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [absen, setAbsen] = useState(null);
  const [jam, setJam] = useState(null);
  const [izin, setIzin] = useState(null);
  const [nip, setNip] = useState("");
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
      })),
    );
  };

  // useeffect me
  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();

        if (!meJson.success || !isMounted) return;

        setRole(meJson.data.role);
        setNip(meJson.data.nip);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  // useeffect pegawai
  useEffect(() => {
    if (!nip) return;

    const fetchPegawai = async () => {
      const res = await fetch(`/api/pegawai/${nip}`);
      const data = await res.json();

      if (data.success) {
        setPegawai(data.data);
      }
    };

    fetchPegawai();
  }, [nip]);

  // useeffect absensi pegawai
  const fetchAbsen = async () => {
    try {
      const res = await fetch("/api/absensi/today");
      const data = await res.json();

      if (!data.success) {
        setAbsen(null);
        return;
      }

      setAbsen(data.data);
    } catch (err) {
      console.error("Gagal fetch absensi:", err);
    }
  };

  useEffect(() => {
    if (!role) return;
    fetchAbsen();
  }, [role]);

  useEffect(() => {
    fetchDataJamKerja();
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
      await fetchAbsen();
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

      const formData = new FormData();
      formData.append("alasan", values.alasan);
      formData.append("tgl_mulai", tglMulai.toISOString());
      formData.append("tgl_selesai", tglSelesai.toISOString());
      formData.append("file", values.upload[0].originFileObj);

      const res = await fetch("/api/izin", {
        method: "POST",
        body: formData, // ⬅️ multipart
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      message.success("Izin berhasil");
    } catch (err) {
      message.error(err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleAbsenPulang = async () => {
    setBtnLoading(true);

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
      await fetchAbsenToday();
    } catch (err) {
      console.error(err.message);
    } finally {
      setBtnLoading(false);
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

  const items = [
    {
      label: "Nama Pegawai",
      children: pegawai?.nama_lengkap || "N/A",
    },
    {
      label: "NIP",
      children: pegawai?.nip || "N/A",
    },
    {
      label: "Jenis Kelamin",
      children: pegawai?.jenis_kelamin || "N/A",
    },
    {
      label: "Jabatan",
      children: pegawai?.jabatan || "N/A",
    },
    {
      label: "Divisi",
      children: pegawai?.divisi?.nama_divisi || "N/A",
    },
    {
      label: "No Telepon",
      children: pegawai?.no_telepon || "N/A",
    },
  ];

  const itemsAbsen = [
    {
      label: "Absen Masuk",
      children: absen?.jam_masuk
        ? dayjs(absen?.jam_masuk).format("YYYY-MM-DD HH:mm:ss")
        : "Belum absen masuk",
    },
    {
      label: "Absen Pulang",
      children: absen?.jam_pulang
        ? dayjs(absen?.jam_pulang).format("YYYY-MM-DD HH:mm:ss")
        : "Belum absen pulang",
    },
  ];

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
            name="upload"
            label="Upload Bukti Dokumen"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Dokumen wajib diupload" }]}
          >
            <Upload
              beforeUpload={() => false} // ⬅️ PENTING
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Upload Dokumen</Button>
            </Upload>
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
        <Skeleton loading={loading} active paragraph={false} title={false}>
          <Descriptions
            title="Informasi Pengguna"
            bordered
            column={1}
            className="desc-user"
            items={items}
          />
        </Skeleton>

        {role === "pegawai" && (
          <div className="mt-5">
            <Skeleton loading={loading} active paragraph={false} title={false}>
              <Descriptions
                title="Absensi Hari Ini"
                bordered
                column={1}
                className="desc-user"
                items={itemsAbsen}
              />
            </Skeleton>
          </div>
        )}

        {role === "pegawai" && (
          <Flex justify="center" align="center" direction="row" gap="middle">
            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginTop: 16 }}
              onClick={showModalAdd}
            >
              Absen Masuk
            </Button>

            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginTop: 16 }}
              onClick={handleAbsenPulang}
              disabled={absen?.jam_masuk ? false : true}
            >
              Absen Pulang
            </Button>

            <Button
              loading={btnLoading}
              type="primary"
              style={{ marginTop: 16 }}
              onClick={showModalIzin}
            >
              Input Izin
            </Button>
          </Flex>
        )}
      </div>
    </>
  );
};

export default BerandaClient;
