"""
Chapter 37 - Feature Detection, Description & Matching
Academic Reference Implementation & Deterministic Verification
Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
"""

import numpy as np
import cv2

def compute_harris_response(image_patch: np.ndarray, k: float = 0.04) -> float:
    """Menghitung nilai respon sudut Harris dari patch citra lokal."""
    # Hitung gradien Sobel sederhana
    dx = cv2.Sobel(image_patch, cv2.CV_64F, 1, 0, ksize=3)
    dy = cv2.Sobel(image_patch, cv2.CV_64F, 0, 1, ksize=3)
    
    Ixx = np.sum(dx * dx)
    Iyy = np.sum(dy * dy)
    Ixy = np.sum(dx * dy)
    
    det = (Ixx * Iyy) - (Ixy * Ixy)
    trace = Ixx + Iyy
    R = det - k * (trace ** 2)
    return float(R)

def calculate_ransac_iterations(p: float, epsilon: float, s: int) -> int:
    """Menghitung jumlah iterasi RANSAC teoritis."""
    w = 1.0 - epsilon
    denom = np.log(1.0 - (w ** s))
    if np.abs(denom) < 1e-12:
        return 1
    num = np.log(1.0 - p)
    N = int(np.ceil(num / denom))
    return N

def lowes_ratio_test(matches_knn, ratio_threshold: float = 0.75):
    """Menyaring pasangan fitur menggunakan aturan Lowe's Ratio Test."""
    good_matches = []
    for m, n in matches_knn:
        if m.distance < ratio_threshold * n.distance:
            good_matches.append(m)
    return good_matches

def test_chapter_37_features():
    print("=== Menjalankan Verifikasi Bab 37: Feature Matching ===")
    
    # 1. Verifikasi Harris Corner pada Patch Sintetis Sudut
    corner_patch = np.zeros((15, 15), dtype=np.float32)
    corner_patch[5:, 5:] = 255.0  # Pola sudut tajam berbentuk L
    
    R_corner = compute_harris_response(corner_patch, k=0.04)
    assert R_corner > 0, f"Respon Harris pada sudut harus positif, didapat: {R_corner}"
    
    # Patch datar homogen harus menghasilkan respon mendekati nol
    flat_patch = np.ones((15, 15), dtype=np.float32) * 128.0
    R_flat = compute_harris_response(flat_patch, k=0.04)
    assert np.isclose(R_flat, 0.0, atol=1e-3), f"Respon Harris pada bidang datar harus mendekati 0: {R_flat}"
    
    # 2. Verifikasi Perhitungan Iterasi RANSAC
    # Kasus dari index.md: p = 0.99, epsilon = 0.40, s = 4 -> expected 34 iterasi
    N_calc = calculate_ransac_iterations(p=0.99, epsilon=0.40, s=4)
    assert N_calc == 34, f"Iterasi RANSAC tidak sesuai: {N_calc} vs expected 34"
    
    # 3. Verifikasi Deteksi Titik Sudut ORB menggunakan OpenCV
    test_img = np.zeros((200, 200), dtype=np.uint8)
    # Gambar persegi dengan 4 sudut tajam
    cv2.rectangle(test_img, (50, 50), (150, 150), 255, -1)
    
    orb = cv2.ORB_create(nfeatures=50)
    keypoints, descriptors = orb.detectAndCompute(test_img, None)
    
    assert len(keypoints) >= 4, f"ORB harus mendeteksi minimal 4 sudut, terdeteksi: {len(keypoints)}"
    assert descriptors is not None, "Deskriptor ORB harus berhasil diekstrak"
    assert descriptors.shape[1] == 32, f"Panjang deskriptor ORB harus 32 byte (256-bit), didapat: {descriptors.shape[1]}"
    
    print(f"PASS Ch 37: Harris R = {R_corner:.2e}, RANSAC Iterations = {N_calc}, ORB Keypoints = {len(keypoints)}")

if __name__ == '__main__':
    test_chapter_37_features()
