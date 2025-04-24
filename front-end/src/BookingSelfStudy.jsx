import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "./assets/Mainpage.jpg";
import toast from "react-hot-toast";

export default function BookingSelfStudy() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [numberOfAttendees, setNumberOfAttendees] = useState(1);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để đặt phòng");
          navigate("/");
          return;
        }

        const response = await fetch("http://localhost:8080/api/v1/allroom", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Fetched rooms:", data.data);
          const availableRoomsData = data.data.filter(room => room.room_status === "Available");
          setAvailableRooms(availableRoomsData);
          console.log("Available rooms:", availableRoomsData);
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

    fetchAvailableRooms();
  }, [navigate]);

  // Tạo dữ liệu lịch
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Calculate first day of the month to determine starting position
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, key: `day-${i}` });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Tạo các khung giờ
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const formatMonthYear = (date) => {
    return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleRoomSelect = (room) => {
    console.log("Selected room:", room);
    if (room) {
      setSelectedRoom(room);
      if (room.room_type === "single") {
        setNumberOfAttendees(1);
      } else {
        setNumberOfAttendees(2);
      }
      toast.success(`Đã chọn ${room.room_type === "group" ? "phòng nhóm" : "phòng đơn"} ${room.location}`);
    }
  };

  const handleBooking = async () => {
    if (!selectedRoom) {
      toast.error("Vui lòng chọn phòng");
      return;
    }
    
    console.log("Current selected room:", selectedRoom);

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày");
      return;
    }
    if (!selectedTime) {
      toast.error("Vui lòng chọn giờ");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để đặt phòng");
        navigate("/");
        return;
      }

      // Create a proper date object with the selected date
      const bookingDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        selectedDate
      );
      
      // Format the date as YYYY-MM-DD
      const formattedDate = bookingDate.toISOString().split("T")[0];

      // Tính giờ kết thúc (2 tiếng sau giờ bắt đầu)
      const [hours, minutes] = selectedTime.split(":");
      const endHours = parseInt(hours) + 2;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes}`;

      // Validate time range
      if (endHours > 22) {
        toast.error("Không thể đặt phòng quá 22:00");
        return;
      }

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        toast.error("Không thể đặt phòng cho ngày trong quá khứ");
        return;
      }

      // If date is today, validate time is not in the past
      if (bookingDate.getTime() === today.getTime()) {
        const currentTime = new Date();
        const selectedDateTime = new Date();
        const [bookingHours, bookingMinutes] = selectedTime.split(':');
        selectedDateTime.setHours(parseInt(bookingHours), parseInt(bookingMinutes), 0, 0);

        if (selectedDateTime < currentTime) {
          toast.error("Không thể đặt phòng cho thời gian đã qua");
          return;
        }
      }

      const bookingData = {
        room_id: parseInt(selectedRoom.room_id, 10), // Đảm bảo room_id là số nguyên
        date: formattedDate,
        start_time: selectedTime,
        end_time: endTime,
        number_of_attendees: parseInt(numberOfAttendees, 10) // Đảm bảo number_of_attendees là số nguyên
      };

      console.log("Sending booking data:", bookingData);

      const response = await fetch("http://localhost:8080/api/v1/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      console.log("Booking response:", data);

      if (response.ok) {
        toast.success(data.message || "Đặt phòng thành công!");
        navigate("/booking-manager");
      } else {
        let errorMessage = data.message || "Lỗi không xác định";
        switch (response.status) {
          case 400:
            errorMessage = data.message;
            break;
          case 401:
            errorMessage = "Vui lòng đăng nhập lại để tiếp tục";
            navigate("/");
            break;
          case 404:
            errorMessage = "Không tìm thấy phòng hoặc thông tin không hợp lệ";
            break;
          case 409:
            errorMessage = "Phòng đã có người đặt trong khung giờ này";
            break;
          default:
            errorMessage = "Lỗi khi đặt phòng: " + errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error booking room:", error);
      toast.error("Lỗi khi đặt phòng");
    }
  };
  
  return (
    <div className="min-h-screen relative">
      {/* Background image with blur */}
      <div
        className="inset-0 bg-cover bg-center fixed"
        style={{
          backgroundImage: `url(${bg})`,
          filter: "blur(3px)",
          zIndex: -1,
        }}
      ></div>
      
      {/* Header */}
      <div className="bg-white bg-opacity-70 py-4 px-6">
        <h1 className="text-4xl font-bold text-center">Đặt chỗ tự học</h1>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Room selection section */}
          <div className="bg-blue-100 bg-opacity-80 rounded-lg p-6 md:w-1/2">
            <h2 className="text-xl font-bold mb-4">Chọn phòng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="text-center col-span-2">Đang tải...</div>
              ) : availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedRoom?.room_id === room.room_id
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-100"
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <h3 className="font-bold">Phòng {room.location}</h3>
                    <p>Tầng: {room.floor}</p>
                    <p>Loại: {room.room_type === "group" ? "Nhóm" : "Đơn"}</p>
                    <p>Còn trống: {room.available_seats} vị trí</p>
                  </div>
                ))
              ) : (
                <div className="text-center col-span-2">Không có phòng trống</div>
              )}
            </div>
          </div>
          
          {/* Calendar section */}
          <div className="bg-white bg-opacity-80 rounded-lg p-6 md:w-1/2">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <button 
                  className="px-2 py-1 text-xl hover:bg-gray-200 rounded-full"
                  onClick={handlePrevMonth}
                >
                  &lt;
                </button>
                <h3 className="text-xl font-bold">{formatMonthYear(currentMonth)}</h3>
                <button 
                  className="px-2 py-1 text-xl hover:bg-gray-200 rounded-full"
                  onClick={handleNextMonth}
                >
                  &gt;
                </button>
              </div>
              
              {/* Calendar grid */}
              <div className="mt-4">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <div key={`header-${day}`} className="text-center font-bold">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ day, key }) => (
                    <div key={key} className="h-10">
                      {day !== null ? (
                        <button
                          className={`w-full h-full flex items-center justify-center rounded-md 
                            ${selectedDate === day ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          {day}
                        </button>
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time selection */}
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-4">Chọn giờ</h3>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={`time-${time}`}
                    className={`py-2 px-4 border rounded-md 
                      ${selectedTime === time ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of attendees */}
            {selectedRoom && selectedRoom.room_type === "group" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số người tham gia
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom.available_seats}
                  value={numberOfAttendees}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setNumberOfAttendees(
                        Math.min(
                          Math.max(1, value),
                          selectedRoom.available_seats
                        )
                      );
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Booking button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBooking}
            disabled={!selectedRoom || !selectedDate || !selectedTime}
            className={`py-3 px-12 rounded-lg text-lg font-bold
              ${
                !selectedRoom || !selectedDate || !selectedTime
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            Đặt phòng
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-600 text-white py-2 mt-12">
        <div className="container mx-auto px-6">
          <p className="text-xs text-gray-300">Tổ kỹ thuật P.DT / Technician</p>
          <p className="text-xs text-gray-300">Email : ddthu@hcmut.edu.vn</p>
          <p className="text-xs text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5258</p>
          <p className="text-xs text-gray-300">Quý Thầy/Cô chưa có tài khoản(hoặc quên mật khẩu) nhà trường vui lòng liên hệ Trung tâm Dữ liệu & Công nghệ Thông tin, phòng 109A5 để được hỗ trợ.</p>
          <p className="text-xs text-gray-300">(For HCMUT account, please contact to : Data and Information Technology Center)</p>
          <p className="text-xs text-gray-300">Email : dl-cntt@hcmut.edu.vn</p>
          <p className="text-xs text-gray-300">ĐT (Tel.) : (84-8) 38647256 - 5200</p>
        </div>
      </div>
    </div>
  );
}