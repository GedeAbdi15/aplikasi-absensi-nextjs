"use client";

import { LoadingOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  Image,
  Input,
  message,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ImgCrop = dynamic(() => import("antd-img-crop"), {
  ssr: false,
});

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const PengaturanProfilClient = () => {
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm();

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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  //   const handleChange = (info) => {
  //     if (info.file.status === "uploading") {
  //       setLoadingAvatar(true);
  //       return;
  //     }

  //     if (info.file.originFileObj) {
  //       getBase64(info.file.originFileObj, (url) => {
  //         setLoadingAvatar(false);
  //         setImageUrl(url);
  //       });
  //     }
  //   };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    message.success("Password berhasil diubah");
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Gagal mengubah password");
  };

  return (
    <>
      <>
        <Typography.Title level={4}>Pengaturan Profil</Typography.Title>

        <Flex gap={24} align="flex-start" wrap="wrap">
          {/* KIRI */}
          <Card
            title="Informasi Pengguna"
            style={{ width: 320 }}
            loading={loading}
          >
            <Flex vertical align="center" gap={16}>
              <ImgCrop rotationSlider>
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : (
                    <button
                      type="button"
                      style={{ border: 0, background: "none" }}
                    >
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </button>
                  )}
                </Upload>
              </ImgCrop>

              {/* IMAGE PREVIEW MODAL */}
              {previewImage && (
                <Image
                  styles={{ root: { display: "none" } }}
                  preview={{
                    open: previewOpen,
                    onOpenChange: (open) => setPreviewOpen(open),
                    afterOpenChange: (open) => !open && setPreviewImage(""),
                  }}
                  src={previewImage}
                  alt="avatar"
                />
              )}

              <div style={{ width: "100%" }}>
                <p>
                  <b>Nama Pegawai</b> : {pegawai?.nama_lengkap}
                </p>
                <p>
                  <b>NIP</b> : {pegawai?.nip}
                </p>
                <p>
                  <b>Jenis Kelamin</b> : {pegawai?.jenis_kelamin}
                </p>
                <p>
                  <b>Jabatan</b> : {pegawai?.jabatan}
                </p>
                <p>
                  <b>Divisi</b> : {pegawai?.divisi?.nama_divisi}
                </p>
                <p>
                  <b>No Telepon</b> : {pegawai?.no_telepon}
                </p>
              </div>
            </Flex>
          </Card>

          {/* KANAN */}
          <Card title="Ubah Password" style={{ width: 360 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Password Baru"
                name="password"
                rules={[
                  { required: true, message: "Password wajib diisi" },
                  { min: 6, message: "Password minimal 6 karakter" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form>
          </Card>
        </Flex>
      </>
    </>
  );
};

export default PengaturanProfilClient;
