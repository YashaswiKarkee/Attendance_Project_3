"use client";
import { useState, useRef } from "react";
import Webcam from "react-webcam";
import Loading from "./loading";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  const router = useRouter();
  const [isFaceLogin, setIsFaceLogin] = useState(false); // Track login type (face or credentials)
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user", // Use the front camera
  };

  const handleSliderChange = () => {
    setIsFaceLogin(!isFaceLogin); // Toggle login method
  };

  const handleCaptureFace = async (getScreenshot) => {
    setIsLoading(true); // Set loading state to true
    const imageSrc = getScreenshot();
    if (imageSrc) {
      console.log("Captured Image:", imageSrc);
      // Convert base64 image to Blob
      const base64Image = imageSrc.split(",")[1]; // Remove base64 prefix
      const byteArray = Uint8Array.from(atob(base64Image), (c) =>
        c.charCodeAt(0)
      );
      const imageBlob = new Blob([byteArray], { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", imageBlob, "face_image.jpg");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${process.env.NEXT_PUBLIC_BACKEND_LOGIN_URL}/face/`,
          {
            method: "POST",
            body: formData, // The browser will automatically set the correct Content-Type
          }
        );

        const data = await response.json();
        console.log("Response from backend:", data);
        if (data.error) {
          const msg = data.message.split(":")[0];
          Swal.fire({
            title: "Login Failed",
            text: msg,
            icon: "error",
          });
        }
        if (!data.error) {
          sessionStorage.setItem("id", data.user_data.id);
          console.log("User data:", data.user_data.id);
          sessionStorage.setItem("username", data.user_data.username);
          sessionStorage.setItem("email", data.user_data.email);
          sessionStorage.setItem("role", data.user_data.role);
          sessionStorage.setItem("username", data.user_data.username);
          sessionStorage.setItem("first_name", data.user_data.first_name);
          sessionStorage.setItem("last_name", data.user_data.last_name);
          Swal.fire({
            title: "Login Successful",
            text: data.message,
            icon: "success",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error sending image to backend:", error);
        Swal.fire({
          title: "Login Failed",
          text: "Some error occured",
          icon: "error",
        });
      } finally {
        setIsLoading(false); // Set loading state to false
      }
    }
  };

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append("email", e.target.email.value);
    formData.append("password", e.target.password.value);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${process.env.NEXT_PUBLIC_BACKEND_LOGIN_URL}/credentials/`,
        {
          body: formData,
          method: "POST",
        }
      );
      const data = await response.json();
      console.log("Response from backend:", data);
      if (data.error) {
        const msg = data.message.split(":")[0];
        Swal.fire({
          title: "Login Failed",
          text: msg,
          icon: "error",
        });
      }
      if (!data.error) {
        sessionStorage.setItem("id", data.id);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("first_name", data.first_name);
        sessionStorage.setItem("last_name", data.last_name);
        Swal.fire({
          title: "Login Successful",
          text: data.message,
          icon: "success",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      Swal.fire({
        title: "Login Failed",
        text: "Some error occured",
        icon: "error",
      });
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Login
        </h2>

        {/* Slider for login type */}
        <div className="flex mb-4 justify-between">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              !isFaceLogin
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-blue-500"
            } rounded-l-lg`}
            onClick={handleSliderChange}
          >
            Credentials Login
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              isFaceLogin
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-blue-500"
            } rounded-r-lg`}
            onClick={handleSliderChange}
          >
            Facial Login
          </button>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* Credentials login form */}
            {!isFaceLogin ? (
              <form onSubmit={handleSubmitCredentials} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 p-3 w-full border border-gray-300 rounded-lg text-gray-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="mt-1 p-3 w-full border border-gray-300 rounded-lg text-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white rounded-lg"
                >
                  Login with Credentials
                </button>
                <div className="text-center mt-4">
                  <p className="text-gray-500">
                    Don't have an account?
                    <span className="text-blue-500">
                      <Link href="/auth/register">Sign Up</Link>
                    </span>
                  </p>
                </div>
              </form>
            ) : (
              // Facial login: Webcam feed
              <div className="flex flex-col items-center space-y-4">
                <Webcam
                  audio={false}
                  height={720}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                >
                  {({ getScreenshot }) => (
                    <>
                      <div className="mb-4">
                        <p className="text-center text-gray-500">
                          Please position your face in front of the camera
                        </p>
                      </div>
                      <button
                        onClick={() => handleCaptureFace(getScreenshot)}
                        className="py-3 px-6 bg-blue-500 text-white rounded-lg"
                      >
                        Capture Face for Login
                      </button>
                      <div className="text-center mt-4">
                        <p className="text-gray-500">
                          Don't have an account?
                          <span className="text-blue-500">
                            <Link href="/auth/register">Sign Up</Link>
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                </Webcam>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;
