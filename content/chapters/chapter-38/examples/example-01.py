"""
Chapter 38 - Camera Calibration & Perspective Transformation
Academic Reference Implementation & Deterministic Verification
Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
"""

import numpy as np
import cv2

def project_3d_to_pixel(point_3d_w: np.ndarray, K: np.ndarray, R: np.ndarray, t: np.ndarray, dist_coeffs=None) -> np.ndarray:
    """Memproyeksikan titik 3D dunia ke bidang sensor piksel 2D dengan atau tanpa distorsi lensa."""
    # 1. Transformasi ke koordinat kamera 3D
    P_c = R @ point_3d_w + t
    Xc, Yc, Zc = P_c[0], P_c[1], P_c[2]
    
    # 2. Koordinat ternormalisasi
    x = Xc / Zc
    y = Yc / Zc
    
    # 3. Terapkan distorsi lensa jika koefisien distorsi diberikan
    if dist_coeffs is not None and len(dist_coeffs) >= 4:
        k1, k2, p1, p2 = dist_coeffs[:4]
        r2 = x*x + y*y
        radial = 1.0 + k1 * r2 + k2 * (r2 ** 2)
        x_dist = x * radial + (2.0 * p1 * x * y + p2 * (r2 + 2.0 * x * x))
        y_dist = y * radial + (p1 * (r2 + 2.0 * y * y) + 2.0 * p2 * x * y)
        x, y = x_dist, y_dist
        
    # 4. Proyeksikan ke koordinat piksel menggunakan K
    fx, fy = K[0, 0], K[1, 1]
    cx, cy = K[0, 2], K[1, 2]
    u = fx * x + cx
    v = fy * y + cy
    return np.array([u, v], dtype=np.float64)

def compute_mean_reprojection_error(objpoints, imgpoints, rvecs, tvecs, K, dist):
    """Menghitung galat reproyeksi kuadrat rata-rata (MRE / RMSE)."""
    total_error = 0.0
    total_points = 0
    for i in range(len(objpoints)):
        imgpoints2, _ = cv2.projectPoints(objpoints[i], rvecs[i], tvecs[i], K, dist)
        error = cv2.norm(imgpoints[i], imgpoints2, cv2.NORM_L2)
        total_error += error * error
        total_points += len(objpoints[i])
    return np.sqrt(total_error / total_points)

def test_chapter_38_calibration():
    print("=== Menjalankan Verifikasi Bab 38: Camera Calibration ===")
    
    # 1. Verifikasi Proyeksi Numerik Pinhole Ideal (Kasus dari index.md)
    K = np.array([
        [800.0, 0.0, 320.0],
        [0.0, 800.0, 240.0],
        [0.0, 0.0, 1.0]
    ], dtype=np.float64)
    R = np.eye(3, dtype=np.float64)
    t = np.array([0.2, -0.1, 1.0], dtype=np.float64)
    Xw = np.array([0.5, 0.3, 4.0], dtype=np.float64)
    
    uv_proj = project_3d_to_pixel(Xw, K, R, t)
    expected_uv = np.array([432.0, 272.0], dtype=np.float64)
    assert np.allclose(uv_proj, expected_uv, atol=1e-5), f"Hasil proyeksi pinhole salah: {uv_proj} vs {expected_uv}"
    
    # 2. Verifikasi Distorsi Radial Barrel (k1 = -0.1)
    dist_barrel = np.array([-0.1, 0.0, 0.0, 0.0], dtype=np.float64)
    uv_dist = project_3d_to_pixel(Xw, K, R, t, dist_coeffs=dist_barrel)
    # Titik terdistorsi barrel harus lebih mendekati pusat optik (320, 240) dibanding titik ideal
    dist_to_center_ideal = np.linalg.norm(uv_proj - np.array([320.0, 240.0]))
    dist_to_center_dist = np.linalg.norm(uv_dist - np.array([320.0, 240.0]))
    assert dist_to_center_dist < dist_to_center_ideal, "Distorsi barrel harus memperkecil radius radial ke pusat optik"
    
    # 3. Verifikasi Konsistensi cv2.projectPoints
    rvec, _ = cv2.Rodrigues(R)
    cv_proj, _ = cv2.projectPoints(Xw.reshape(1, 1, 3), rvec, t.reshape(3, 1), K, dist_barrel)
    cv_uv = cv_proj.ravel()
    assert np.allclose(uv_dist, cv_uv, atol=1e-4), f"Inkonsistensi implementasi manual dengan OpenCV: {uv_dist} vs {cv_uv}"
    
    print(f"PASS Ch 38: Pinhole UV = {uv_proj}, Distorted UV = {uv_dist}, OpenCV Match = OK")

if __name__ == '__main__':
    test_chapter_38_calibration()
