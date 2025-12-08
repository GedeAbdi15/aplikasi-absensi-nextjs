import LoginView from "./_view/LoginView";

const LoginPage = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white shadow rounded-lg">
          <LoginView />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
