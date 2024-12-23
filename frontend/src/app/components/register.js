"use client";
import React, { useState } from "react";
import Webcam from "react-webcam";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline"; // Correct import for v2
import Swal from "sweetalert2";

const RegisterForm = () => {
  const [step, setStep] = useState(1); // Track the step (1 - form, 2 - capture image)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Handle form data changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Check if all fields are filled
  const areAllFieldsFilled = () => {
    return Object.values(formData).every((value) => value.trim() !== "");
  };

  // Validate password and confirm password match
  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle Next button click (go to step 2 - webcam capture)
  const handleNextClick = () => {
    if (!areAllFieldsFilled()) {
      setErrorMessage("All fields are required");
      return;
    }
    if (!validatePasswords()) return;

    setStep(2); // Go to webcam capture step
    setErrorMessage(null); // Reset error message
  };

  // Handle Register button click (send data and image to backend)
  const handleRegisterClick = async () => {
    if (!capturedImage) {
      setErrorMessage("Please capture your image");
      return;
    }

    const formDataWithImage = new FormData();
    formDataWithImage.append("email", formData.email);
    formDataWithImage.append("password", formData.password);
    formDataWithImage.append("username", formData.username);
    formDataWithImage.append("first_name", formData.firstName);
    formDataWithImage.append("last_name", formData.lastName);

    // Convert image to blob and append it
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    formDataWithImage.append("profile_picture", blob, "profile.jpg");

    // Send form data to backend (adjust URL and backend API as needed)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/register/`,
        {
          method: "POST",
          body: formDataWithImage,
        }
      );

      const data = res.json();

      if (!data.error) {
        Swal.fire({
          icon: "success",
          title: "Registered successfully!",
          text: "You can now proceed with login.",
        });
        window.location.href = "/auth/login";
      }
      if (data.error) {
        // Handle errors (backend response)
        const msg = data.message.split(":")[0];
        Swal.fire({
          icon: "error",
          title: "Error Occured",
          text: msg,
        });
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  // Capture the user's image from webcam
  const handleCapture = (getScreenshot) => {
    const screenshot = getScreenshot();
    if (screenshot) {
      setCapturedImage(screenshot);
      Swal.fire({
        icon: "success",
        title: "Image captured successfully!",
        text: "You can now proceed with registration.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Image capture failed!",
        text: "Please try again.",
      });
    }
  };

  // Go back to previous step
  const handleBackClick = () => {
    setStep(1); // Go back to step 1 (form)
    setErrorMessage(null); // Reset error message
  };

  // Render form or webcam step based on the current step
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-lg">
      <div className="absolute top-4 left-4">
        {step === 2 && (
          <button
            onClick={handleBackClick}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        Register
      </h2>
      {step === 1 ? (
        <div>
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}

          <div className="mt-6">
            <button
              onClick={handleNextClick}
              className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          </div>

          <p className="mt-4 text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl text-center mb-4 text-gray-700">
            Capture Your Image
          </h3>

          <Webcam
            audio={false}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "user",
            }}
          >
            {({ getScreenshot }) => (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleCapture(getScreenshot)}
                  className="p-3 bg-green-500 text-white rounded-md"
                >
                  Capture Photo
                </button>
              </div>
            )}
          </Webcam>
          <div className="mb-4 mt-4">
            <p className="text-center text-gray-500">
              Please position your face in front of the camera
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleRegisterClick}
              className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Register
            </button>
          </div>
          <p className="mt-4 text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;

// "use client";
// import React, { useState } from "react";
// import Webcam from "react-webcam";
// import Link from "next/link";
// import { ArrowLeftIcon } from "@heroicons/react/24/outline";
// import Swal from "sweetalert2";

// const RegisterForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     username: "",
//     firstName: "",
//     lastName: "",
//   });
//   const [capturedImages, setCapturedImages] = useState({
//     profile_picture: null,
//     up: null,
//     down: null,
//     left: null,
//     right: null,
//   });
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Handle form data changes
//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Check if all fields are filled
//   const areAllFieldsFilled = () => {
//     return Object.values(formData).every((value) => value.trim() !== "");
//   };

//   // Validate password and confirm password match
//   const validatePasswords = () => {
//     if (formData.password !== formData.confirmPassword) {
//       setErrorMessage("Passwords do not match");
//       return false;
//     }
//     return true;
//   };

//   // Handle Next button click (go to step 2 - webcam capture)
//   const handleNextClick = () => {
//     if (!areAllFieldsFilled()) {
//       setErrorMessage("All fields are required");
//       return;
//     }
//     if (!validatePasswords()) return;

//     setStep(2); // Go to webcam capture step
//     setErrorMessage(null); // Reset error message
//   };

//   // Handle Register button click (send data and images to backend)
//   const handleRegisterClick = async () => {
//     if (Object.values(capturedImages).some((image) => image === null)) {
//       setErrorMessage("Please capture all required images");
//       return;
//     }

//     const formDataWithImages = new FormData();
//     formDataWithImages.append("email", formData.email);
//     formDataWithImages.append("password", formData.password);
//     formDataWithImages.append("username", formData.username);
//     formDataWithImages.append("first_name", formData.firstName);
//     formDataWithImages.append("last_name", formData.lastName);

//     // Append each captured image to the form data
//     for (const [key, value] of Object.entries(capturedImages)) {
//       const response = await fetch(value);
//       const blob = await response.blob();
//       formDataWithImages.append(key, blob, `${key}.jpg`);
//     }

//     // Send form data to backend (adjust URL and backend API as needed)
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/register/`,
//         {
//           method: "POST",
//           body: formDataWithImages,
//         }
//       );

//       const data = await res.json();

//       if (!data.error) {
//         Swal.fire({
//           icon: "success",
//           title: "Registered successfully!",
//           text: "You can now proceed with login.",
//         });
//         window.location.href = "/auth/login";
//       }
//       if (data.error) {
//         // Handle errors (backend response)
//         const msg = data.message.split(":")[0];
//         Swal.fire({
//           icon: "error",
//           title: "Error Occurred",
//           text: msg,
//         });
//         setErrorMessage(msg);
//       }
//     } catch (error) {
//       console.error("Error registering:", error);
//     }
//   };

//   // Capture the user's image from webcam
//   const handleCapture = (getScreenshot, position) => {
//     const screenshot = getScreenshot();
//     if (screenshot) {
//       setCapturedImages((prevImages) => ({
//         ...prevImages,
//         [position]: screenshot,
//       }));
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       {step === 1 ? (
//         <div>
//           <h3 className="text-xl text-center mb-4 text-gray-700">Register</h3>
//           <div className="space-y-4">
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//             <input
//               type="password"
//               name="confirmPassword"
//               placeholder="Confirm Password"
//               value={formData.confirmPassword}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               value={formData.username}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//             <input
//               type="text"
//               name="firstName"
//               placeholder="First Name"
//               value={formData.firstName}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//             <input
//               type="text"
//               name="lastName"
//               placeholder="Last Name"
//               value={formData.lastName}
//               onChange={handleInputChange}
//               className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
//               required
//             />
//           </div>

//           {errorMessage && (
//             <p className="text-red-500 text-center mt-4">{errorMessage}</p>
//           )}

//           <div className="mt-6">
//             <button
//               onClick={handleNextClick}
//               className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Next
//             </button>
//           </div>

//           <p className="mt-4 text-center text-gray-500">
//             Already have an account?{" "}
//             <Link href="/auth/login" className="text-blue-500 hover:underline">
//               Log In
//             </Link>
//           </p>
//         </div>
//       ) : (
//         <div>
//           <h3 className="text-xl text-center mb-4 text-gray-700">
//             Capture Your Images
//           </h3>

//           {["profile_picture", "up", "down", "left", "right"].map(
//             (position) => (
//               <div key={position} className="mb-4">
//                 <Webcam
//                   audio={false}
//                   screenshotFormat="image/jpeg"
//                   width="100%"
//                   videoConstraints={{
//                     facingMode: "user",
//                   }}
//                 >
//                   {({ getScreenshot }) => (
//                     <div className="flex justify-center mt-4">
//                       <button
//                         onClick={() => handleCapture(getScreenshot, position)}
//                         className="p-3 bg-green-500 text-white rounded-md"
//                       >
//                         Capture {position.replace("_", " ")}
//                       </button>
//                     </div>
//                   )}
//                 </Webcam>
//                 {capturedImages[position] && (
//                   <img
//                     src={capturedImages[position]}
//                     alt={`${position} preview`}
//                     className="mt-2 w-full"
//                   />
//                 )}
//               </div>
//             )
//           )}

//           <div className="mt-6">
//             <button
//               onClick={handleRegisterClick}
//               className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Register
//             </button>
//           </div>
//           <p className="mt-4 text-center text-gray-500">
//             Already have an account?{" "}
//             <Link href="/auth/login" className="text-blue-500 hover:underline">
//               Log In
//             </Link>
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RegisterForm;
