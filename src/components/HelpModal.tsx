import React from 'react';
import { X, Gamepad2, Smartphone, Keyboard } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>🎮 Hướng Dẫn Chơi</h2>
          <button className="help-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="help-modal-body">
          <div className="help-section">
            <div className="help-section-title">
              <Keyboard size={20} />
              <span>Điều Khiển Bàn Phím</span>
            </div>
            <div className="help-controls">
              <div className="help-control-item">
                <kbd>↑ ↓ ← →</kbd>
                <span>Di chuyển rắn</span>
              </div>
              <div className="help-control-item">
                <kbd>W A S D</kbd>
                <span>Di chuyển rắn (thay thế)</span>
              </div>
              <div className="help-control-item">
                <kbd>Space</kbd>
                <span>Tạm dừng/Tiếp tục</span>
              </div>
              <div className="help-control-item">
                <kbd>Enter</kbd>
                <span>Bắt đầu game</span>
              </div>
              <div className="help-control-item">
                <kbd>R</kbd>
                <span>Khởi động lại</span>
              </div>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-title">
              <Smartphone size={20} />
              <span>Điều Khiển Di Động</span>
            </div>
            <div className="help-controls">
              <div className="help-control-item">
                <div className="mobile-control-demo">
                  <div className="demo-btn">↑</div>
                  <div className="demo-btn">←</div>
                  <div className="demo-btn">→</div>
                  <div className="demo-btn">↓</div>
                </div>
                <span>Chạm vào các nút điều hướng</span>
              </div>
            </div>
          </div>

          <div className="help-section">
            <div className="help-section-title">
              <Gamepad2 size={20} />
              <span>Cách Chơi</span>
            </div>
            <div className="help-gameplay">
              <div className="help-gameplay-item">
                <span className="food-demo red">🔴</span>
                <div>
                  <strong>Thức ăn thường</strong>
                  <p>+1 điểm, làm rắn dài thêm</p>
                </div>
              </div>
              <div className="help-gameplay-item">
                <span className="food-demo blue">🔵</span>
                <div>
                  <strong>Thức ăn đặc biệt</strong>
                  <p>+5 điểm, xuất hiện mỗi 12 điểm, biến mất sau 6 giây</p>
                </div>
              </div>
              <div className="help-gameplay-item">
                <span className="food-demo">🏆</span>
                <div>
                  <strong>Lên level</strong>
                  <p>Mỗi 15 điểm, tăng tốc độ và thêm chướng ngại vật</p>
                </div>
              </div>
              <div className="help-gameplay-item">
                <span className="food-demo danger">⚠️</span>
                <div>
                  <strong>Tránh va chạm</strong>
                  <p>Tường, chướng ngại vật và thân rắn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
