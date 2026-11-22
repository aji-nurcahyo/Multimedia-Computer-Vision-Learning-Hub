"""
Multimedia & Computer Vision Learning Hub
Chapter 07: Color Models & Color Space Transformation Verification
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2


def create_color_scene() -> np.ndarray:
    img = np.full((180, 240, 3), 40, dtype=np.uint8)
    cv2.rectangle(img, (20, 30), (80, 130), (220, 30, 30), -1)   # Merah
    cv2.circle(img, (130, 80), 35, (30, 210, 50), -1)             # Hijau
    cv2.rectangle(img, (175, 40), (225, 140), (30, 110, 235), -1) # Biru
    return img


def main():
    print("=" * 64)
    print("Multimedia & Computer Vision Hub - Chapter 07 Verification")
    print("=" * 64)

    rgb = create_color_scene()
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    ycrcb = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)

    print(f"HSV shape: {hsv.shape}, YCrCb shape: {ycrcb.shape}, CIELAB shape: {lab.shape}")

    # Cek nilai HSV pusat objek hijau (130, 80) -> Hue OpenCV mendekati 65 (130 deg)
    h_green, s_green, v_green = hsv[80, 130]
    print(f"HSV Pusat Hijau (OpenCV uint8): H={h_green}, S={s_green}, V={v_green}")
    assert 50 <= h_green <= 80

    # Segmentasi warna biru (H_cv antara 100..125)
    mask_blue = cv2.inRange(hsv, np.array([100, 100, 50]), np.array([125, 255, 255]))
    blue_area = int(np.sum(mask_blue == 255))
    print(f"Luas Area Segmentasi Biru: {blue_area} piksel")
    assert mask_blue[80, 200] == 255 and mask_blue[80, 130] == 0

    # Verifikasi CIELAB piksel putih murni -> L*=255 (100 diskalakan ke 255), a*=128, b*=128
    white_patch = np.full((4, 4, 3), 255, dtype=np.uint8)
    white_lab = cv2.cvtColor(white_patch, cv2.COLOR_RGB2LAB)
    print(f"White Patch CIELAB (OpenCV uint8): {white_lab[0, 0].tolist()}")
    assert white_lab[0, 0, 0] == 255 and abs(int(white_lab[0, 0, 1]) - 128) <= 1

    print("Verifikasi Chapter 07 BERHASIL!")


if __name__ == "__main__":
    main()

