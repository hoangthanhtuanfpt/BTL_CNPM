import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "./assets/Mainpage.jpg";
import toast from 'react-hot-toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-white">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

export default function FeedbackForm() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/allroom");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.data || []);
      } else {
        toast.error("Không thể tải danh sách phòng");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };
  
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error("Vui lòng chọn vị trí");
      return;
    }
  
    if (rating === 0) {
      toast.error("Vui lòng đánh giá mức độ hài lòng");
      return;
    }
  
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để gửi đánh giá");
      navigate("/");
      return;
    }
  
    // Trước khi gửi, cần lấy thông tin người dùng hiện tại để lấy MSSV
    try {
      // Lấy thông tin người dùng từ API
      const userResponse = await fetch("http://localhost:8080/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!userResponse.ok) {
        toast.error("Không thể lấy thông tin người dùng");
        return;
      }
  
      const userData = await userResponse.json();
      const mssv = userData.data?.mssv;
  
      if (!mssv) {
        toast.error("Không tìm thấy mã số sinh viên");
        return;
      }
  
      // Tạo payload với thông tin MSSV
      const payload = {
        mssv: mssv,               // Thêm MSSV vào payload
        roomId: selectedLocation, // Giữ nguyên roomId
        rating: Number(rating),
        comment: comment.trim()
      };
  
      // Gửi đánh giá với payload đã có MSSV
      const res = await fetch("http://localhost:8080/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
        navigate("/FeedbackSuccess");
      } else {
        console.error("Server error response:", data);
        toast.error(data.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.");
    }
  };
  
  const handleRatingClick = (value) => {
    setRating(value);
  };
  
  return (
    <div className="justify-center min-h-screen bg-gray-100">
      {/* Background image with blur */}
      <div
        className="inset-0 bg-cover bg-center fixed"
        style={{
          backgroundImage: `url(${bg})`,
          filter: "blur(3px)",
          zIndex: 1,
        }}
      ></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center p-4 bg-transparent">
          <div className="w-30% h-24 bg-white bg-opacity-15 p-4 shadow-lg rounded-lg border-2 border-gray-400 flex flex-col justify-center mr-8">
            <p className="font-bold text-2xl">Smart Study Space Management &</p>
            <p className="font-bold text-2xl">Reservation System at HCMUT</p>
          </div>
          <div className="flex-grow flex">
            <button
              onClick={() => navigate("/main")}
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Trang chủ
            </button>
            <button
              onClick={() => navigate("/finding-room")}
              className="ml-4 flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Tìm phòng
            </button>
            <button
              onClick={() => navigate("/booking-manager")}
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Quản lý đặt chỗ
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="flex-grow bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Báo cáo
            </button>
            <button
              onClick={() => navigate("/support")}
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Hỗ trợ
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-black hover:bg-gray-100 hover:text-black text-white py-2 px-8 rounded-2xl transition duration-200 mr-10"
            >
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
        
        {/* Feedback Form Container */}
        <div className="mx-auto p-6 bg-gray-800 bg-opacity-70 rounded-lg shadow-lg max-w-4xl mt-4">
          <ErrorBoundary>
            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-600">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-t-lg font-medium">
                Gửi đánh giá
              </button>
              <button className="px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg font-medium ml-2">
                Báo lỗi thiết bị
              </button>
              <button className="px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg font-medium ml-2">
                Lịch sử phản hồi
              </button>
            </div>
            
            {/* Form */}
            {loading ? (
              <div className="text-center text-white text-xl">Đang tải...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Vị trí:</label>
                  <select
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {rooms.map((room) => (
                      <option key={room.room_id} value={room.room_id}>
                        {room.building} - Phòng {room.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white mb-2">Mức độ hài lòng</label>
                  <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className={`text-3xl focus:outline-none transition-colors ${
                          star <= rating ? "text-yellow-400" : "text-gray-400"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-white mb-2">Nhận xét</label>
                  <textarea
                    className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md h-32"
                    placeholder="Thêm nhận xét của bạn...."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                >
                  Gửi đánh giá
                </button>
              </form>
            )}
          </ErrorBoundary>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bottom-0 left-0 right-0 text-center text-white z-10 bg-gray-600 mt-12">
        <br />
        <p className="text-xs text-left ml-6 text-gray-300">Tổ kỹ thuật P.DT / Technician</p>
        <p className="text-xs text-left ml-6 text-gray-300">Email : ddthu@hcmut.edu.vn</p>
        <p className="text-xs text-left ml-6 text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5258</p>
        <p className="text-xs text-left ml-6 text-gray-300">
          Quý Thầy/Cô chưa có tài khoản(hoặc quên mật khẩu) nhà trường vui lòng liên hệ Trung tâm Dữ liệu & Công nghệ
          Thông tin, phòng 109A5 để được hỗ trợ.
        </p>
        <p className="text-xs text-left ml-6 text-gray-300">
          (For HCMUT account, please contact to : Data and Information Technology Center)
        </p>
        <p className="text-xs text-left ml-6 text-gray-300">Email : dl-cntt@hcmut.edu.vn</p>
        <p className="text-xs text-left ml-6 text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5200</p>
      </div>
    </div>
  );
}