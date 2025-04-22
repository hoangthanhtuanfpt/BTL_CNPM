import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "./assets/Mainpage.jpg";
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const handleBookNow = async (roomId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để đặt chỗ");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/booking/book-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Đặt chỗ thành công!");
        fetchRooms(); // Refresh room data
      } else {
        toast.error(data.message || "Không thể đặt chỗ");
      }
    } catch (error) {
      console.error("Error booking room:", error);
      toast.error("Lỗi khi đặt chỗ");
    }
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <div className="justify-center min-h-screen bg-gray-100">
      {/* Background image with blur */}
      <div
        className="inset-0 bg-cover bg-center absolute"
        style={{
          backgroundImage: `url(${bg})`,
          filter: "blur(3px)",
          zIndex: 1,
        }}
      ></div>
      
      {/* Main content */}
      <div className="relative p-4 z-10">
        {/* Header */}
        <div className="flex flex-grow items-center space-x-4 mb-4">
          <div className="w-30% h-24 bg-white bg-opacity-15 p-4 shadow-lg rounded-lg border-2 border-gray-400 flex flex-col justify-center mr-8">
            <p className="font-bold text-2xl">Smart Study Space Management &</p>
            <p className="font-bold text-2xl">Reservation System at HCMUT</p>
          </div>
          <div className="flex-grow flex">
            <Link
              to="/main"
              className="flex-grow bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Trang chủ
            </Link>
            <Link
              to="/finding-room"
              className="ml-4 flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Tìm chỗ
            </Link>
            <Link
              to="/booking-manager"
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Quản lý đặt chỗ
            </Link>
            <Link
              to="/reports"
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Báo cáo
            </Link>
            <Link
              to="/support"
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Hỗ trợ
            </Link>
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="bg-black hover:bg-gray-100 hover:text-black text-white py-2 px-8 rounded-2xl transition duration-200"
              >
                <i className="fas fa-user"></i>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                  <button
                    onClick={() => navigate("/UserProfile")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      localStorage.removeItem("user_info");
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="flex space-x-4 h-48 mt-16 ml-8">
          <div className="w-5/12 font-medium bg-white p-4 shadow-lg rounded-lg mr-60 bg-opacity-15">
            {/* Summary and management box */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
              {/* Room count */}
              <div className="text-white text-center text-lg flex flex-col items-center justify-center col-span-1 row-span-1">
                <p>Số phòng trống</p>
                <p className="text-3xl font-bold">100</p>
              </div>
              
              {/* Management buttons */}
              <Link
                to="/room-management"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 col-span-1 row-span-1 flex items-center justify-center"
              >
                Quản lý phòng
              </Link>
              <Link
                to="/my-bookings"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 col-span-1 row-span-1 flex flex-col items-center justify-center"
              >
                <span>Đặt chỗ của tôi</span>
                <span>4</span>
              </Link>
              <Link
                to="/booking-history"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 col-span-1 row-span-1 flex items-center justify-center"
              >
                Lịch sử đặt chỗ
              </Link>
            </div>
          </div>
          
          {/* Featured room */}
          <div className="flex w-1/3 bg-white bg-opacity-15 p-4 shadow-lg rounded-lg grid grid-cols-2 font-medium">
            <div className="ml-4 text-white col-span-1 grid grid-row-6">
              <p className="text-white row-span-1 font-medium">
                {" "}
                Phòng: 334 - H1
              </p>
              <br />
              <p>Tầng: 3</p>
              <p className="bg-green-200 text-black text-center w-12 col-span-1">
                Trống
              </p>
              <p>Loại: Đơn</p>
              <p>Còn trống: 3 vị trí</p>
              <p>Thiết bị: Ổ cắm</p>
            </div>
            <div className="flex justify-center">
              <button className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg px-6 font-medium transition duration-200 h-[66px]">
                Đặt chỗ ngay
              </button>
            </div>
          </div>
        </div>
        
        {/* Room cards */}
        <div className="flex space-x-20 mt-4 mt-40 h-48">
          {loading ? (
            <div className="text-center text-white text-xl">Đang tải...</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.room_id}
                className="flex w-1/3 bg-white bg-opacity-15 p-4 shadow-lg rounded-lg grid grid-cols-2 font-medium"
              >
                <div className="text-white col-span-1 grid grid-row-6">
                  <p className="text-white row-span-1 font-medium">
                    {" "}
                    Phòng: {room.location} - {room.building}
                  </p>
                  <br />
                  <p>Tầng: {room.floor}</p>
                  <p className={`inline-block px-3 py-1 rounded-full ${
                    room.room_status === "Available"
                      ? "bg-green-500"
                      : room.room_status === "Occupied"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}>
                    {room.room_status === "Available"
                      ? "Trống"
                      : room.room_status === "Occupied"
                      ? "Đã đầy"
                      : "Bảo trì"}
                  </p>
                  <p>Loại: {room.room_type === "group" ? "Nhóm" : "Đơn"}</p>
                  <p>Còn trống: {room.available_seats} vị trí</p>
                  <p>Thiết bị: {room.devices || "Không có"}</p>
                </div>
                <div className="flex justify-center">
                  <button
                    className={`flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 ${
                      room.room_status !== "Available" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleBookNow(room.room_id)}
                    disabled={room.room_status !== "Available"}
                  >
                    Đặt chỗ ngay
                  </button>
                  <button
                    className="flex-1 bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
                    onClick={() => navigate("/room-details", { state: { roomId: room.room_id } })}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bottom-0 left-0 right-0 text-center text-white z-10 bg-gray-600 mt-20">
        <br />
        <p className="text-xs text-left ml-6 text-gray-300">Tổ kỹ thuật P.DT / Technician</p>
        <p className="text-xs text-left ml-6 text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5258</p>
        <p className="text-xs text-left ml-6 text-gray-300">
          Quý Thầy/Cô chưa có tài khoản(hoặc quên mật khẩu) nhà trường vui lòng liên hệ Trung tâm Dữ liệu & Công nghệ
          Thông tin, phòng 109A5 để được hỗ trợ.
        </p>
        <p className="text-xs text-left ml-6 text-gray-300">Email: ddthu@hcmut.edu.vn </p>
        <p className="text-xs text-left ml-6 text-gray-300">
          (For HCMUT account, please contact to : Data and Information Technology Center)
        </p>
        <p className="text-xs text-left ml-6 text-gray-300">Email : dl-cntt@hcmut.edu.vn</p>
        <p className="text-xs text-left ml-6 text-gray-300">
          (For HCMUT account, please contact to : Data and Information Technology Center)
        </p>
        <p className="text-xs text-left ml-6 text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5200</p>
      </div>
    </div>
  );
}