import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "./assets/Mainpage.jpg";
import toast from 'react-hot-toast';

export default function FindingRoom() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    building: "Tất cả",
    floor: "Tất cả",
    type: "Tất cả",
    date: "",
    time: "",
    equipment: "Tất cả",
  });

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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckAvailability = async (roomId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để kiểm tra phòng");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId,
          date: filters.date,
          time: filters.time,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.available) {
          toast.success("Phòng có sẵn để đặt!");
          navigate("/room-details", { state: { roomId, date: filters.date, time: filters.time } });
        } else {
          toast.error("Phòng không có sẵn trong thời gian này");
        }
      } else {
        toast.error(data.message || "Không thể kiểm tra tình trạng phòng");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Lỗi khi kiểm tra tình trạng phòng");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      (filters.building === "Tất cả" || room.building === filters.building) &&
      (filters.floor === "Tất cả" || room.floor === parseInt(filters.floor)) &&
      (filters.type === "Tất cả" || room.room_type === (filters.type === "Nhóm" ? "group" : "single")) &&
      (filters.equipment === "Tất cả" || room.devices?.includes(filters.equipment))
    );
  });

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
              className="flex-grow hover:text-gray-100 text-black py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              {" "}
              Trang chủ
            </Link>
            <Link
              to="/finding-room"
              className="ml-4 flex-grow bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
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
            <Link
              to="/profile"
              className="bg-black hover:bg-gray-100 hover:text-black text-white py-2 px-8 rounded-2xl transition duration-200 mr-10"
            >
              <i className="fas fa-user"></i>
            </Link>
          </div>
        </div>

        {/* Search filters */}
        <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Tìm kiếm nhanh</h2>
          <div className="grid grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tòa nhà</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.building}
                onChange={(e) => handleFilterChange("building", e.target.value)}
              >
                <option>Tất cả</option>
                <option>H1</option>
                <option>H2</option>
                <option>H3</option>
                <option>H6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tầng</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.floor}
                onChange={(e) => handleFilterChange("floor", e.target.value)}
              >
                <option>Tất cả</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option>Tất cả</option>
                <option>Đơn</option>
                <option>Nhóm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.time}
                onChange={(e) => handleFilterChange("time", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thiết bị</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.equipment}
                onChange={(e) => handleFilterChange("equipment", e.target.value)}
              >
                <option>Tất cả</option>
                <option>Ổ cắm</option>
                <option>Máy chiếu</option>
                <option>Điều hòa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Room cards grid */}
        {loading ? (
          <div className="text-center text-white text-xl">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.room_id}
                className="bg-white bg-opacity-15 p-6 rounded-lg shadow-lg"
              >
                <div className="text-white space-y-2">
                  <h3 className="text-xl font-bold">
                    Phòng {room.location} - {room.building}
                  </h3>
                  <p>Tầng: {room.floor}</p>
                  <p>Loại: {room.room_type === "group" ? "Nhóm" : "Đơn"}</p>
                  <p>Số chỗ trống: {room.available_seats}</p>
                  <p>Thiết bị: {room.devices || "Không có"}</p>
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
                </div>
                <div className="mt-4">
                  <button
                    className={`w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 ${
                      room.room_status !== "Available" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleCheckAvailability(room.room_id)}
                    disabled={room.room_status !== "Available"}
                  >
                    Kiểm tra & Đặt chỗ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bottom-0 left-0 right-0 text-center text-white z-10 bg-gray-600">
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