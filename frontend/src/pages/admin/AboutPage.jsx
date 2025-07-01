import React from "react";

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 mt-16">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        Giới thiệu về chúng tôi
      </h1>
      <p className="text-gray-700 text-lg mt-4 text-center">
        Chào mừng bạn đến với nền tảng của chúng tôi! Chúng tôi tạo ra một không
        gian nơi mọi người có thể học tập, chia sẻ và kết nối với nhau.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-semibold text-blue-500">🎯 Sứ mệnh</h2>
          <p className="text-gray-600 mt-2">
            Tạo ra một môi trường học tập mở, nơi mọi người có thể tiếp cận kiến
            thức và trao đổi ý tưởng một cách dễ dàng.
          </p>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-semibold text-green-500">🚀 Tầm nhìn</h2>
          <p className="text-gray-600 mt-2">
            Trở thành nền tảng giáo dục hàng đầu, kết nối cộng đồng học tập trên
            toàn thế giới.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Đội ngũ phát triển</h2>
        <p className="text-gray-600 mt-2">
          Chúng tôi gồm những người yêu công nghệ, giáo dục và sáng tạo.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
