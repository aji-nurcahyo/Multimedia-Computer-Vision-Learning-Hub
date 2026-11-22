"""
Chapter 36 - Computer Vision Foundations & Image Geometry
Academic Reference Implementation & Deterministic Verification
Author: Aji Pamungkas Tri Nurcahyo (Institut Teknologi Sumatera)
"""

import numpy as np

def create_affine_matrix(scale=(1.0, 1.0), angle_deg=0.0, translation=(0.0, 0.0)):
    """Menghasilkan matriks transformasi afinitas 3x3 homogen."""
    sx, sy = scale
    tx, ty = translation
    rad = np.radians(angle_deg)
    cos_a, sin_a = np.cos(rad), np.sin(rad)
    
    # M = T * R * S
    M = np.array([
        [sx * cos_a, -sy * sin_a, tx],
        [sx * sin_a,  sy * cos_a, ty],
        [0.0,         0.0,        1.0]
    ], dtype=np.float64)
    return M

def bilinear_interpolate(image: np.ndarray, x: float, y: float) -> float:
    """Melakukan interpolasi bilinear pada koordinat riil kontinu (x, y)."""
    H, W = image.shape[:2]
    if x < 0 or x >= W - 1 or y < 0 or y >= H - 1:
        return 0.0  # Zero padding border
    
    x1, y1 = int(np.floor(x)), int(np.floor(y))
    x2, y2 = x1 + 1, y1 + 1
    
    alpha = x - x1
    beta = y - y1
    
    val = (
        (1.0 - alpha) * (1.0 - beta) * image[y1, x1] +
        alpha * (1.0 - beta) * image[y1, x2] +
        (1.0 - alpha) * beta * image[y2, x1] +
        alpha * beta * image[y2, x2]
    )
    return float(val)

def test_chapter_36_geometry():
    print("=== Menjalankan Verifikasi Bab 36: Image Geometry ===")
    
    # 1. Verifikasi Inversi Matriks Afinitas
    M = create_affine_matrix(scale=(1.5, 0.8), angle_deg=30.0, translation=(12.0, -8.0))
    M_inv = np.linalg.inv(M)
    identity = M @ M_inv
    assert np.allclose(identity, np.eye(3)), "Inversi matriks afinitas gagal"
    
    # 2. Verifikasi Transformasi Koordinat Homogen
    p_orig = np.array([25.0, 40.0, 1.0], dtype=np.float64)
    p_trans = M @ p_orig
    p_recovered = M_inv @ p_trans
    assert np.allclose(p_orig, p_recovered), "Siklus transformasi forward-inverse melenceng"
    
    # 3. Verifikasi Interpolasi Bilinear Manual vs Komputasi
    # Menggunakan nilai dari contoh numerik pada index.md:
    # I = [[10, 20, 40, 50], [30, 60, 80, 90], [70, 100, 140, 160], [120, 150, 180, 210]]
    # (x, y) = (1.4, 2.7) -> expected ~148.2
    test_patch = np.array([
        [10, 20, 40, 50],
        [30, 60, 80, 90],
        [70, 100, 140, 160],
        [120, 150, 180, 210]
    ], dtype=np.float64)
    
    interp_val = bilinear_interpolate(test_patch, 1.4, 2.7)
    expected_val = 148.2
    assert np.isclose(interp_val, expected_val, atol=1e-5), f"Bilinear mismatch: {interp_val} vs {expected_val}"
    
    # 4. Verifikasi Reprojection Error Homografi Sederhana
    H_true = np.array([
        [1.2, 0.1, 5.0],
        [-0.05, 1.1, 10.0],
        [0.0002, 0.0001, 1.0]
    ], dtype=np.float64)
    pts_src = np.array([
        [0.0, 0.0, 1.0],
        [100.0, 0.0, 1.0],
        [100.0, 100.0, 1.0],
        [0.0, 100.0, 1.0]
    ]).T
    
    pts_dst_homo = H_true @ pts_src
    pts_dst = pts_dst_homo[:2] / pts_dst_homo[2]
    
    # Reprojection error dengan ground truth bernilai 0
    reprojected = (H_true @ pts_src)
    reprojected = reprojected[:2] / reprojected[2]
    reproj_err = np.mean(np.linalg.norm(pts_dst - reprojected, axis=0))
    assert reproj_err < 1e-6, "Reprojection error pada ground truth harus nol"
    
    print(f"PASS Ch 36: Transformed Pt = {p_trans[:2]}, Bilinear Val = {interp_val:.2f}, Reproj Error = {reproj_err:.2e}")

if __name__ == '__main__':
    test_chapter_36_geometry()
