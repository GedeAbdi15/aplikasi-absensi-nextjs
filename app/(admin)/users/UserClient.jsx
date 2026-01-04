"use client";

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const UserPageClient = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchPegawai = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/pegawai");
      const data = await res.json();
      console.log("PEGAWAI RAW:", data);

      if (data.success === false) {
        message.error(data.error?.message || "Gagal memuat data pegawai");
        return;
      }

      setDataSource(
        data.data?.map((item) => ({
          key: item.id_pegawai,
          ...item,
          nama_divisi: item.divisi?.nama_divisi || "",
        })) || []
      );
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisi = async () => {
    const res = await fetch("/api/divisi");
    const data = await res.json();

    if (data.success === false) {
      message.error("Gagal mengambil data divisi");
      return;
    }

    setDivisiOptions(
      data.data.map((d) => ({
        label: d.nama_divisi,
        value: d.id_divisi,
      }))
    );
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPegawai();
      await fetchDivisi();
    };

    loadData();
  }, []);

  const showModalAdd = () => {
    setIsEdit(false);
    setSelectedPegawai(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showModalEdit = (record) => {
    setIsEdit(true);
    setSelectedPegawai(record);

    form.setFieldsValue({
      nip: record.nip,
      nama_lengkap: record.nama_lengkap,
      jenis_kelamin: record.jenis_kelamin,
      jabatan: record.jabatan,
      no_telepon: record.no_telepon,
      id_divisi: record.id_divisi,
      tgl_lahir: record.tgl_lahir ? dayjs(record.tgl_lahir) : null,
    });

    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      tgl_lahir: values.tgl_lahir
        ? values.tgl_lahir.format("YYYY-MM-DD")
        : null,
    };

    console.log("SUBMIT PAYLOAD: ", payload);

    try {
      let res;

      if (isEdit && selectedPegawai) {
        res = await fetch(`/api/pegawai/${selectedPegawai.id_pegawai}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/pegawai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      console.log("SUBMIT RES:", data);

      if (data.success === false) {
        message.error(data.error?.message || "Gagal menyimpan data");
        return;
      }

      message.success(
        isEdit ? "Berhasil mengedit pegawai" : "Berhasil menambahkan pegawai"
      );

      setIsModalOpen(false);
      fetchPegawai();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan server");
    }
  };

  const deletePegawai = async (record) => {
    Modal.confirm({
      title: "Hapus Pegawai?",
      content: `Yakin ingin menghapus pegawai ${record.nama_lengkap}?`,
      okText: "Ya, hapus",
      cancelText: "Batal",
      onOk: async () => {
        const res = await fetch(`/api/pegawai/${record.id_pegawai}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (data.success === false) {
          message.error(data.error?.message || "Gagal menghapus pegawai");
          return;
        }

        message.success("Pegawai berhasil dihapus");
        fetchPegawai();
      },
    });
  };

  const columns = [
    { title: "NIP", dataIndex: "nip" },
    { title: "Nama Lengkap", dataIndex: "nama_lengkap" },
    { title: "Jenis Kelamin", dataIndex: "jenis_kelamin" },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
    { title: "Jabatan", dataIndex: "jabatan" },
    { title: "Divisi", dataIndex: "nama_divisi" },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => showModalEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => deletePegawai(record)}>
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-5">
        <h1>Data Pegawai</h1>
        <Button color="primary" variant="solid" onClick={showModalAdd}>
          Tambah Pegawai
        </Button>
      </div>

      <Modal
        title={isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="NIP" name="nip" rules={[{ required: true }]}>
            <Input disabled={isEdit} />
          </Form.Item>

          <Form.Item
            label="Nama Lengkap"
            name="nama_lengkap"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Jenis Kelamin" name="jenis_kelamin">
            <Select
              options={[
                { value: "Laki-laki", label: "Laki-laki" },
                { value: "Perempuan", label: "Perempuan" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Tanggal Lahir" name="tgl_lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Jabatan" name="jabatan">
            <Input />
          </Form.Item>

          <Form.Item label="Divisi" name="id_divisi">
            <Select options={divisiOptions} />
          </Form.Item>

          <Form.Item label="No Telepon" name="no_telepon">
            <Input />
          </Form.Item>

          <Form.Item
            label="Set Password"
            name="password"
            hidden={isEdit ? true : false}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={dataSource} loading={loading} />
    </>
  );
};

export default UserPageClient;
