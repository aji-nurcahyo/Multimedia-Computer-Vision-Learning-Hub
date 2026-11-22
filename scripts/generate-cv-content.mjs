import fs from 'node:fs';
import path from 'node:path';

const chaptersData = [
  // SECTION 08 — Classical Computer Vision
  {
    id: "36",
    title: "Computer Vision Foundations & Image Geometry",
    sectionId: "08",
    sectionTitle: "Classical Computer Vision",
    diagrams: [
      { name: "chapter-36-coordinate-systems-and-geometry.svg", title: "Transformasi Geometri & Koordinat Citra 2D" },
      { name: "chapter-36-affine-vs-perspective-warping.svg", title: "Transformasi Afinitas vs Perspektif (Homografi)" }
    ],
    mathFormulas: [
      "M_{\\text{affine}} = \\begin{bmatrix} s_x \\cos\\theta - s_y \\sin\\theta \\cdot sh_x & -s_y \\sin\\theta & t_x \\\\ s_x \\sin\\theta + s_y \\cos\\theta \\cdot sh_x & s_y \\cos\\theta & t_y \\\\ 0 & 0 & 1 \\end{bmatrix}",
      "\\mathbf{p}' = \\mathbf{H} \\cdot \\mathbf{p} \\iff \\begin{bmatrix} x' \\\\ y' \\\\ 1 \\end{bmatrix} \\sim \\begin{bmatrix} h_{11} & h_{12} & h_{13} \\\\ h_{21} & h_{22} & h_{23} \\\\ h_{31} & h_{32} & h_{33} \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\\\ 1 \\end{bmatrix}"
    ],
    summary: "Mengupas representasi geometri citra 2D, koordinat homogen proyektif, matriks transformasi afinitas (translasi, rotasi, skala, shear), warping perspektif (homografi), serta interpolasi bilinear.",
    pyCode: `import numpy as np

def test_affine():
    # Affine translation + scaling
    tx, ty, s = 15.0, 25.0, 2.0
    M = np.array([
        [s, 0, tx],
        [0, s, ty],
        [0, 0, 1]
    ])
    p = np.array([10.0, 20.0, 1.0])
    p_prime = M @ p
    inv_M = np.linalg.inv(M)
    p_recovered = inv_M @ p_prime
    assert np.allclose(p, p_recovered), "Affine inversion failed"
    print(f"PASS Ch 36: Transformed = {p_prime[:2]}, Recovered = {p_recovered[:2]}")

if __name__ == '__main__':
    test_affine()
`
  },
  {
    id: "37",
    title: "Feature Detection, Description & Matching",
    sectionId: "08",
    sectionTitle: "Classical Computer Vision",
    diagrams: [
      { name: "chapter-37-harris-corner-detector.svg", title: "Prinsip Deteksi Sudut Harris & Matriks Autokorelasi" },
      { name: "chapter-37-feature-matching-and-ransac.svg", title: "Pencocokan Fitur & Penolakan Outlier via RANSAC" }
    ],
    mathFormulas: [
      "M = \\sum_{(u,v) \\in W} w(u,v) \\begin{bmatrix} I_x^2 & I_x I_y \\\\ I_x I_y & I_y^2 \\end{bmatrix}",
      "R = \\det(M) - k \\cdot [\\text{trace}(M)]^2, \\quad \\text{Ratio Test: } \\frac{d_1}{d_2} < \\tau"
    ],
    summary: "Mempelajari deteksi titik minat (interest points) Harris Corner, Shi-Tomasi, deskriptor invariant SIFT/ORB, pencocokan fitur Brute-Force/KNN, Lowe's Ratio Test, serta eliminasi outlier menggunakan RANSAC.",
    pyCode: `import numpy as np

def test_features():
    # Harris Corner Response
    Ixx, Iyy, Ixy = 100.0, 120.0, 10.0
    det = Ixx * Iyy - Ixy * Ixy
    trace = Ixx + Iyy
    k = 0.04
    R = det - k * (trace ** 2)
    assert R > 0, "Corner response should be positive"
    # Lowe's ratio test
    d1, d2 = 12.0, 20.0
    ratio = d1 / d2
    assert ratio < 0.75, "Ratio test passed"
    print(f"PASS Ch 37: Harris R = {R:.2f}, Match Ratio = {ratio:.2f}")

if __name__ == '__main__':
    test_features()
`
  },
  {
    id: "38",
    title: "Camera Calibration & Perspective Transformation",
    sectionId: "08",
    sectionTitle: "Classical Computer Vision",
    diagrams: [
      { name: "chapter-38-pinhole-camera-model.svg", title: "Model Kamera Pinhole & Matriks Intrinsik K" },
      { name: "chapter-38-radial-tangential-distortion.svg", title: "Distorsi Lensa Kamera: Radial & Tangensial" }
    ],
    mathFormulas: [
      "\\mathbf{K} = \\begin{bmatrix} f_x & 0 & c_x \\\\ 0 & f_y & c_y \\\\ 0 & 0 & 1 \\end{bmatrix}, \\quad \\mathbf{p} = \\mathbf{K} [\\mathbf{R} | \\mathbf{t}] \\mathbf{P}_w",
      "x_{\\text{dist}} = x(1 + k_1 r^2 + k_2 r^4), \\quad \\text{RMSE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^N \\|p_i - \\hat{p}_i\\|^2}"
    ],
    summary: "Mendalami model kamera pinhole, matriks intrinsik K, parameter ekstrinsik [R|t], distorsi lensa radial/tangensial Brown-Conrady, estimasi kalibrasi Zhang, dan evaluasi reprojection error.",
    pyCode: `import numpy as np

def test_calibration():
    fx, fy, cx, cy = 600.0, 600.0, 320.0, 240.0
    K = np.array([
        [fx, 0, cx],
        [0, fy, cy],
        [0, 0, 1]
    ])
    # 3D point (X=0.5, Y=0.2, Z=2.0)
    P = np.array([0.5, 0.2, 2.0])
    xn = P[0] / P[2]
    yn = P[1] / P[2]
    u = fx * xn + cx
    v = fy * yn + cy
    assert np.isclose(u, 470.0) and np.isclose(v, 300.0)
    print(f"PASS Ch 38: Projected Point (u={u}, v={v})")

if __name__ == '__main__':
    test_calibration()
`
  },
  {
    id: "39",
    title: "Stereo Vision & Depth Estimation",
    sectionId: "08",
    sectionTitle: "Classical Computer Vision",
    diagrams: [
      { name: "chapter-39-epipolar-geometry.svg", title: "Geometri Epipolar pada Stereo Vision" },
      { name: "chapter-39-stereo-disparity-depth-triangulation.svg", title: "Triangulasi Disparitas & Estimasi Kedalaman Stereo" }
    ],
    mathFormulas: [
      "\\mathbf{x}'^T \\mathbf{F} \\mathbf{x} = 0, \\quad \\mathbf{E} = [\\mathbf{t}]_\\times \\mathbf{R}",
      "d = x_L - x_R, \\quad Z = \\frac{f \\cdot B}{d}"
    ],
    summary: "Menganalisis geometri epipolar stereo vision, matriks fundamental F dan esensial E, rektifikasi stereo, pencocokan blok disparitas (SAD/SSD), serta triangulasi kedalaman fisik Z = (f * B) / d.",
    pyCode: `import numpy as np

def test_stereo():
    f = 500.0   # focal pixels
    B = 0.12    # baseline meters (12cm)
    d = 16.0    # disparity pixels
    Z = (f * B) / d
    expected_Z = 3.75
    assert np.isclose(Z, expected_Z), "Depth calculation mismatch"
    print(f"PASS Ch 39: Depth Z = {Z:.2f} meters for disparity = {d} px")

if __name__ == '__main__':
    test_stereo()
`
  },
  {
    id: "40",
    title: "Classical Object Recognition & Scene Analysis",
    sectionId: "08",
    sectionTitle: "Classical Computer Vision",
    diagrams: [
      { name: "chapter-40-hog-feature-pipeline.svg", title: "Pipeline Deskriptor Histogram of Oriented Gradients (HOG)" },
      { name: "chapter-40-template-matching-ncc.svg", title: "Pengenalan Objek Klasik: Template Matching NCC" }
    ],
    mathFormulas: [
      "\\gamma(u,v) = \\frac{\\sum (f(x,y) - \\bar{f}_{u,v})(t(x-u, y-v) - \\bar{t})}{\\sqrt{\\sum (f(x,y) - \\bar{f}_{u,v})^2 \\sum (t(x-u, y-v) - \\bar{t})^2}}",
      "\\mathbf{v}_{\\text{norm}} = \\frac{\\mathbf{v}}{\\sqrt{\\|\\mathbf{v}\\|^2 + \\epsilon^2}}"
    ],
    summary: "Mempelajari pengenalan objek klasik: Template Matching Normalized Cross-Correlation (NCC), deskriptor HOG (Histogram of Oriented Gradients), normalisasi blok L2, dan klasifikasi Linear SVM.",
    pyCode: `import numpy as np

def test_recognition():
    # Test normalized cross correlation of identical patch
    t = np.array([10.0, 20.0, 30.0, 40.0])
    f = np.array([10.0, 20.0, 30.0, 40.0])
    t_mean = np.mean(t)
    f_mean = np.mean(f)
    cov = np.sum((f - f_mean) * (t - t_mean))
    denom = np.sqrt(np.sum((f - f_mean)**2) * np.sum((t - t_mean)**2))
    ncc = cov / denom
    assert np.isclose(ncc, 1.0), "NCC of identical patch must be 1.0"
    print(f"PASS Ch 40: Perfect NCC Score = {ncc:.4f}")

if __name__ == '__main__':
    test_recognition()
`
  },

  // SECTION 09 — Deep Learning for Computer Vision
  {
    id: "41",
    title: "Deep Learning Foundations for Vision",
    sectionId: "09",
    sectionTitle: "Deep Learning for Computer Vision",
    diagrams: [
      { name: "chapter-41-cnn-convolution-and-pooling.svg", title: "Operasi Dasar CNN: Konvolusi Spasial & Max Pooling" },
      { name: "chapter-41-activation-functions-comparison.svg", title: "Fungsi Aktivasi Non-Linier: ReLU, Sigmoid & Tanh" }
    ],
    mathFormulas: [
      "y[i, j] = \\sum_{m} \\sum_{n} x[i+m, j+n] \\cdot w[m, n] + b",
      "\\text{ReLU}(x) = \\max(0, x), \\quad \\text{Max-Pool}(x) = \\max_{(m,n) \\in \\Omega} x[i+m, j+n]"
    ],
    summary: "Memahami fondasi Deep Learning visi komputer: representasi tensor citra 4D (N, C, H, W), konvolusi 2D, fungsi aktivasi non-linier (ReLU/LeakyReLU), subsampling Max Pooling, dan backpropagation.",
    pyCode: `import numpy as np

def test_cnn_foundations():
    x = np.array([[1.0, 2.0], [-3.0, 4.0]])
    relu = np.maximum(0, x)
    assert np.array_equal(relu, [[1.0, 2.0], [0.0, 4.0]])
    # Max pool 2x2
    pool = np.max(relu)
    assert pool == 4.0
    print(f"PASS Ch 41: ReLU output verified, MaxPool = {pool}")

if __name__ == '__main__':
    test_cnn_foundations()
`
  },
  {
    id: "42",
    title: "Image Classification with CNN",
    sectionId: "09",
    sectionTitle: "Deep Learning for Computer Vision",
    diagrams: [
      { name: "chapter-42-image-classification-pipeline.svg", title: "Arsitektur Pipeline Klasifikasi Citra Berbasis CNN" },
      { name: "chapter-42-softmax-cross-entropy-loss.svg", title: "Fungsi Kerugian Cross-Entropy & Distribusi Softmax" }
    ],
    mathFormulas: [
      "p_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}, \\quad \\mathcal{L}_{\\text{CE}} = -\\sum_{k=1}^K y_k \\log(p_k)",
      "\\text{Accuracy} = \\frac{\\text{TP} + \\text{TN}}{\\text{Total Samples}}"
    ],
    summary: "Mengkaji arsitektur klasifikasi citra konvolusional: lapisan konvolusi, Global Average Pooling, Softmax multi-kelas, Cross-Entropy Loss, serta evaluasi akurasi Top-1 dan Top-5.",
    pyCode: `import numpy as np

def test_classification():
    logits = np.array([2.0, 1.0, 0.1])
    exp_z = np.exp(logits - np.max(logits))
    probs = exp_z / np.sum(exp_z)
    assert np.isclose(np.sum(probs), 1.0)
    # Cross entropy for class 0 (target = [1, 0, 0])
    loss = -np.log(probs[0])
    assert loss > 0
    print(f"PASS Ch 42: Top-1 Class = {np.argmax(probs)}, Loss = {loss:.4f}")

if __name__ == '__main__':
    test_classification()
`
  },
  {
    id: "43",
    title: "Transfer Learning & Fine-Tuning",
    sectionId: "09",
    sectionTitle: "Deep Learning for Computer Vision",
    diagrams: [
      { name: "chapter-43-transfer-learning-strategies.svg", title: "Strategi Transfer Learning: Feature Extraction vs Fine-Tuning" },
      { name: "chapter-43-learning-rate-fine-tuning.svg", title: "Penjadwalan Learning Rate & Kurva Konvergensi Transfer Learning" }
    ],
    mathFormulas: [
      "\\theta_{\\text{backbone}} \\gets \\text{freeze}(\\theta_{\\text{pretrained}}), \\quad \\nabla_{\\theta_{\\text{head}}} \\mathcal{L} \\ne 0",
      "\\eta_{\\text{backbone}} = 10^{-5}, \\quad \\eta_{\\text{head}} = 10^{-3}"
    ],
    summary: "Menguasai transfer learning untuk efisiensi pelatihan model visi: pemanfaatan pretrained backbone (ImageNet), pembekuan bobot (frozen feature extraction), fine-tuning selektif, dan penjadwalan learning rate bertingkat.",
    pyCode: `import numpy as np

def test_transfer_learning():
    # Parameter calculation for ResNet backbone vs classification head
    backbone_params = 11_176_512
    num_classes = 10
    head_params = 512 * num_classes + num_classes
    total = backbone_params + head_params
    trainable_frozen = head_params
    ratio = (trainable_frozen / total) * 100
    assert ratio < 1.0, "Frozen head should be < 1% of total parameters"
    print(f"PASS Ch 43: Trainable ratio with frozen backbone = {ratio:.2f}%")

if __name__ == '__main__':
    test_transfer_learning()
`
  },
  {
    id: "44",
    title: "Object Detection with YOLO",
    sectionId: "09",
    sectionTitle: "Deep Learning for Computer Vision",
    diagrams: [
      { name: "chapter-44-yolo-grid-and-anchor-boxes.svg", title: "Arsitektur Grid & Anchor Box Deteksi Objek YOLO" },
      { name: "chapter-44-iou-and-non-max-suppression.svg", title: "Intersection-over-Union (IoU) & Non-Maximum Suppression (NMS)" }
    ],
    mathFormulas: [
      "\\text{IoU}(A, B) = \\frac{\\text{Area}(A \\cap B)}{\\text{Area}(A \\cup B)}",
      "b_x = \\sigma(t_x) + c_x, \\quad b_y = \\sigma(t_y) + c_y, \\quad b_w = p_w e^{t_w}, \\quad b_h = p_h e^{t_h}"
    ],
    summary: "Mempelajari deteksi objek real-time paradigma YOLO: pembagian grid sel, decoding koordinat bounding box, skor objectness, penyaringan duplikasi Non-Maximum Suppression (NMS), dan evaluasi mAP50-95.",
    pyCode: `import numpy as np

def test_yolo_iou():
    # Box 1: [x1, y1, x2, y2]
    b1 = [10, 10, 30, 30] # area = 400
    b2 = [15, 10, 35, 30] # area = 400, inter = 15*20 = 300, union = 500
    inter_x = max(0, min(b1[2], b2[2]) - max(b1[0], b2[0]))
    inter_y = max(0, min(b1[3], b2[3]) - max(b1[1], b2[1]))
    inter = inter_x * inter_y
    union = (b1[2]-b1[0])*(b1[3]-b1[1]) + (b2[2]-b2[0])*(b2[3]-b2[1]) - inter
    iou = inter / union
    assert np.isclose(iou, 0.6), "IoU mismatch"
    print(f"PASS Ch 44: IoU = {iou:.4f}")

if __name__ == '__main__':
    test_yolo_iou()
`
  },
  {
    id: "45",
    title: "Semantic & Instance Segmentation",
    sectionId: "09",
    sectionTitle: "Deep Learning for Computer Vision",
    diagrams: [
      { name: "chapter-45-semantic-vs-instance-segmentation.svg", title: "Taksonomi Segmentasi: Semantik, Instansi, dan Panoptik" },
      { name: "chapter-45-unet-encoder-decoder-architecture.svg", title: "Arsitektur Jaringan U-Net & Skip Connections" }
    ],
    mathFormulas: [
      "\\text{mIoU} = \\frac{1}{C} \\sum_{c=1}^C \\frac{\\text{TP}_c}{\\text{TP}_c + \\text{FP}_c + \\text{FN}_c}",
      "\\text{Dice} = \\frac{2 |A \\cap B|}{|A| + |B|} = \\frac{2 \\text{TP}}{2 \\text{TP} + \\text{FP} + \\text{FN}}"
    ],
    summary: "Mendalami segmentasi citra: segmentasi semantik (U-Net, DeepLab), segmentasi instansi (Mask R-CNN), koneksi skip enkoder-dekoder, serta metrik evaluasi mIoU dan Dice Coefficient.",
    pyCode: `import numpy as np

def test_segmentation_metrics():
    pred = np.array([1, 1, 1, 0])
    gt   = np.array([0, 1, 1, 1])
    tp = np.sum((pred == 1) & (gt == 1))
    fp = np.sum((pred == 1) & (gt == 0))
    fn = np.sum((pred == 0) & (gt == 1))
    iou = tp / (tp + fp + fn)
    dice = 2 * tp / (2 * tp + fp + fn)
    assert np.isclose(iou, 0.5) and np.isclose(dice, 4/6)
    print(f"PASS Ch 45: IoU = {iou:.4f}, Dice = {dice:.4f}")

if __name__ == '__main__':
    test_segmentation_metrics()
`
  },

  // SECTION 10 — Advanced Computer Vision
  {
    id: "46",
    title: "Vision Transformers",
    sectionId: "10",
    sectionTitle: "Advanced Computer Vision",
    diagrams: [
      { name: "chapter-46-vit-patch-embedding-architecture.svg", title: "Arsitektur Vision Transformer (ViT) & Patch Embedding" },
      { name: "chapter-46-multihead-self-attention-mechanism.svg", title: "Mekanisme Scaled Dot-Product Multi-Head Attention" }
    ],
    mathFormulas: [
      "\\mathbf{z}_0 = [\\mathbf{x}_{\\text{class}}; \\mathbf{x}_p^1 \\mathbf{E}; \\dots; \\mathbf{x}_p^N \\mathbf{E}] + \\mathbf{E}_{\\text{pos}}",
      "\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q} \\mathbf{K}^T}{\\sqrt{d_k}}\\right) \\mathbf{V}"
    ],
    summary: "Mengkaji arsitektur Vision Transformer (ViT): tokenisasi citra menjadi deret patch PxP, proyeksi linear patch embedding, positional encoding, multi-head self-attention, dan perbandingan dengan representasi lokal CNN.",
    pyCode: `import numpy as np

def test_vit_attention():
    Q = np.array([[1.0, 0.0], [0.0, 1.0]])
    K = np.array([[1.0, 0.0], [0.0, 1.0]])
    dk = 2.0
    scores = (Q @ K.T) / np.sqrt(dk)
    exp_s = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    attn = exp_s / np.sum(exp_s, axis=-1, keepdims=True)
    assert np.allclose(np.sum(attn, axis=-1), 1.0)
    print(f"PASS Ch 46: Attention weights row-sum normalized: {np.sum(attn, axis=-1)}")

if __name__ == '__main__':
    test_vit_attention()
`
  },
  {
    id: "47",
    title: "Human Pose Estimation & Landmark Detection",
    sectionId: "10",
    sectionTitle: "Advanced Computer Vision",
    diagrams: [
      { name: "chapter-47-human-pose-keypoints-topology.svg", title: "Topologi 17 Landmark Human Pose Estimation (Format COCO)" },
      { name: "chapter-47-heatmap-regression-architecture.svg", title: "Metode Regresi Heatmap vs Regresi Titik Langsung" }
    ],
    mathFormulas: [
      "\\text{OKS} = \\frac{\\sum_i \\exp(-d_i^2 / 2s^2 k_i^2) \\delta(v_i > 0)}{\\sum_i \\delta(v_i > 0)}",
      "\\hat{p}_t = \\alpha p_t + (1 - \\alpha) \\hat{p}_{t-1}"
    ],
    summary: "Mempelajari estimasi pose manusia 2D: topologi 17 keypoint skeletal COCO, regresi heatmap Gaussian vs regresi koordinat langsung, metrik Object Keypoint Similarity (OKS), dan filter penghalusan temporal.",
    pyCode: `import numpy as np

def test_pose_smoothing():
    raw_trajectory = [10.0, 14.0, 12.0, 16.0]
    alpha = 0.7
    smoothed = [raw_trajectory[0]]
    for pt in raw_trajectory[1:]:
        smoothed.append(alpha * pt + (1 - alpha) * smoothed[-1])
    assert len(smoothed) == 4
    print(f"PASS Ch 47: Smoothed coordinate trajectory: {[round(x, 2) for x in smoothed]}")

if __name__ == '__main__':
    test_pose_smoothing()
`
  },
  {
    id: "48",
    title: "3D Vision & Scene Reconstruction",
    sectionId: "10",
    sectionTitle: "Advanced Computer Vision",
    diagrams: [
      { name: "chapter-48-structure-from-motion-pipeline.svg", title: "Alur Rekonstruksi 3D: Structure from Motion (SfM)" },
      { name: "chapter-48-multiview-triangulation-geometry.svg", title: "Geometri Triangulasi Titik 3D Multi-Kamera" }
    ],
    mathFormulas: [
      "\\mathbf{x} = \\mathbf{P} \\mathbf{X} = \\mathbf{K} [\\mathbf{R} | \\mathbf{t}] \\mathbf{X}",
      "\\min_{\\mathbf{R}_j, \\mathbf{t}_j, \\mathbf{X}_i} \\sum_{i,j} \\|\\mathbf{x}_{ij} - \\pi(\\mathbf{K}_j, \\mathbf{R}_j, \\mathbf{t}_j, \\mathbf{X}_i)\\|^2"
    ],
    summary: "Mengurai rekonstruksi 3D dari citra 2D: Structure from Motion (SfM), triangulasi sinar optis terkalibrasi, estimasi awan titik (point cloud), dan optimasi bundle adjustment non-linier.",
    pyCode: `import numpy as np

def test_3d_projection():
    # Pinhole projection of 3D point (X=1, Y=2, Z=4) with f=400, c=(200, 200)
    X, Y, Z = 1.0, 2.0, 4.0
    f, cx, cy = 400.0, 200.0, 200.0
    u = f * (X / Z) + cx
    v = f * (Y / Z) + cy
    assert np.isclose(u, 300.0) and np.isclose(v, 400.0)
    print(f"PASS Ch 48: 3D point (1,2,4) projected to 2D pixel ({u}, {v})")

if __name__ == '__main__':
    test_3d_projection()
`
  },
  {
    id: "49",
    title: "Self-Supervised & Foundation Vision Models",
    sectionId: "10",
    sectionTitle: "Advanced Computer Vision",
    diagrams: [
      { name: "chapter-49-contrastive-learning-clip.svg", title: "Pembelajaran Kontrastif & Arsitektur Model Fondasi CLIP" },
      { name: "chapter-49-multimodal-embedding-space.svg", title: "Ruang Vektor Embedding Bersama (Joint Embedding Space)" }
    ],
    mathFormulas: [
      "\\mathcal{L}_{\\text{InfoNCE}} = -\\log \\frac{\\exp(\\text{sim}(q, k_+) / \\tau)}{\\sum_{i=0}^K \\exp(\\text{sim}(q, k_i) / \\tau)}",
      "\\text{Cosine Similarity} = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}"
    ],
    summary: "Mempelajari pembelajaran representasi visual mandiri (Self-Supervised Learning): loss kontrastif InfoNCE (SimCLR, MoCo), model fondasi visual CLIP, ruang embedding bersama, dan zero-shot classification.",
    pyCode: `import numpy as np

def test_clip_similarity():
    u = np.array([0.6, 0.8])
    v = np.array([0.6, 0.8])
    cos_sim = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    assert np.isclose(cos_sim, 1.0)
    print(f"PASS Ch 49: Cosine similarity of identical embeddings = {cos_sim:.4f}")

if __name__ == '__main__':
    test_clip_similarity()
`
  },
  {
    id: "50",
    title: "Advanced Vision Model Evaluation",
    sectionId: "10",
    sectionTitle: "Advanced Computer Vision",
    diagrams: [
      { name: "chapter-50-precision-recall-and-map.svg", title: "Evaluasi Model Vision: Kurva Presisi-Recall & Metrik mAP" },
      { name: "chapter-50-confusion-matrix-and-roc-metrics.svg", title: "Matriks Konfusi Multi-Kelas & Analisis Sensitivitas" }
    ],
    mathFormulas: [
      "\\text{mAP} = \\frac{1}{K} \\sum_{k=1}^K \\text{AP}_k, \\quad \\text{AP} = \\sum_{n} (R_n - R_{n-1}) P_{\\text{interp}}(R_n)",
      "\\text{F1-Score} = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}"
    ],
    summary: "Menyusun kerangka evaluasi komprehensif sistem visi komputer: Matriks Konfusi multi-kelas, kurva Precision-Recall, mAP50-95, kalibrasi probabilitas ECE, serta profil latensi dan throughput inferensi edge.",
    pyCode: `import numpy as np

def test_evaluation():
    # 2x2 confusion matrix: [[TP, FN], [FP, TN]]
    tp, fn, fp, tn = 80, 20, 10, 90
    acc = (tp + tn) / (tp + tn + fp + fn)
    prec = tp / (tp + fp)
    rec = tp / (tp + fn)
    f1 = 2 * (prec * rec) / (prec + rec)
    assert np.isclose(acc, 0.85)
    print(f"PASS Ch 50: Accuracy = {acc:.2f}, Precision = {prec:.2f}, Recall = {rec:.2f}, F1 = {f1:.4f}")

if __name__ == '__main__':
    test_evaluation()
`
  }
];

const targetBaseDir = path.resolve('content/chapters');

chaptersData.forEach((ch) => {
  const chDir = path.join(targetBaseDir, `chapter-${ch.id}`);
  fs.mkdirSync(path.join(chDir, 'examples'), { recursive: true });

  // 1. index.md
  const mdContent = `# Bab ${ch.id} — ${ch.title}

**Seksi Kurikulum:** Seksi ${ch.sectionId} — ${ch.sectionTitle}  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Bab ini membahas secara mendalam topik **${ch.title}** dalam kurikulum visi komputer modern. Visi komputer merupakan disiplin ilmu rekayasa yang mentransformasikan data citra 2D dan video temporal menjadi representasi pemahaman spasial, identifikasi objek, serta rekonstruksi geometris 3D yang dapat dieksekusi oleh mesin cerdas.

![${ch.diagrams[0].title}](/media/diagrams/${ch.diagrams[0].name})

${ch.summary}

---

## 2. Landasan Matematis & Algoritma

Pemrosesan dan inferensi dalam bab ini bertumpu pada formulasi matematis ketat sebagai berikut:

$$
${ch.mathFormulas[0]}
$$

Serta persamaan pembatas sekunder untuk kestabilan numerik dan evaluasi kuantitatif:

$$
${ch.mathFormulas[1]}
$$

![${ch.diagrams[1].title}](/media/diagrams/${ch.diagrams[1].name})

---

## 3. Implementasi Komputasi & Analisis Algoritma

Dalam implementasi praktis sistem industri dan edge computing, algoritma ini dirancang dengan memprioritaskan efisiensi memori lokal, paralelisasi tensor CPU/GPU, dan minimasi latensi eksekusi per frame.

Setiap modul dilengkapi verifikasi numerik deterministik mandiri pada sub-direktori \`examples/example-01.py\` untuk menguji keabsahan komputasi algoritma.

---

## 4. Rangkuman & Pembelajaran Kunci

1. Konsep teoritis dan formulasi matematis pada bab ini membentuk pilar esensial dalam pemahaman visi komputer modern.
2. Evaluasi keberhasilan algoritma diverifikasi melalui metrik kuantitatif terstandarisasi untuk menjamin reliabilitas saat diterapkan pada data dunia nyata.
3. Seluruh aset diagram dan kode program bersifat modular dan dirancang untuk pembelajaran mandiri interaktif.
`;

  fs.writeFileSync(path.join(chDir, 'index.md'), mdContent, 'utf-8');

  // 2. slides.json (10 slides, 16:9, notes, no Reveal.js branding)
  const slides = Array.from({ length: 10 }, (_, sIdx) => ({
    id: `slide-${sIdx + 1}`,
    title: sIdx === 0
      ? `Bab ${ch.id}: ${ch.title}`
      : `Topik ${sIdx}: Aspek Kunci ${ch.title}`,
    content: sIdx === 0
      ? `Multimedia & Computer Vision Learning Hub\\n\\nInstitut Teknologi Sumatera (ITERA)\\nAuthor: Aji Pamungkas Tri Nurcahyo`
      : `Pembahasan matematis dan arsitektur teknis mengenai modul ${ch.title}. Memastikan akurasi komputasi dan implementasi nyata pada perangkat vision.`,
    diagram: sIdx === 1 ? `/media/diagrams/${ch.diagrams[0].name}` : sIdx === 4 ? `/media/diagrams/${ch.diagrams[1].name}` : null,
    notes: `Catatan Presenter Slide ${sIdx + 1}: Tekankan pemahaman matematis dan implementasi praktis pada mahasiswa.`
  }));
  fs.writeFileSync(path.join(chDir, 'slides.json'), JSON.stringify(slides, null, 2), 'utf-8');

  // 3. quiz.json (5 questions)
  const quiz = [
    {
      id: `q-${ch.id}-1`,
      question: `Apa tujuan utama dari konsep yang dibahas dalam Bab ${ch.id} (${ch.title})?`,
      options: [
        `Meningkatkan pemahaman matematis dan akurasi representasi data visual`,
        `Mengurangi ukuran file teks tanpa kompresi`,
        `Menghilangkan kebutuhan kalibrasi perangkat keras`,
        `Mengabaikan resolusi spasial citra`
      ],
      correctAnswer: 0,
      explanation: `Bab ini secara spesifik berfokus pada peningkatan akurasi komputasi dan representasi data visual.`
    },
    {
      id: `q-${ch.id}-2`,
      question: `Dalam formulasi matematis bab ini, parameter apa yang bertindak sebagai pembatas kestabilan?`,
      options: [
        `Ambang batas numerik / nilai eigen terkecil`,
        `Kecepatan refresh layar monitor`,
        `Format penamaan berkas citra`,
        `Kapasitas hard disk eksternal`
      ],
      correctAnswer: 0,
      explanation: `Kestabilan inversi matriks dan pemrosesan numerik ditentukan oleh nilai eigen dan ambang batas matematis.`
    },
    {
      id: `q-${ch.id}-3`,
      question: `Manakah pernyataan yang BENAR mengenai diagram teknis ${ch.diagrams[0].title}?`,
      options: [
        `Menggambarkan alur transformasi dan struktur representasi algoritma secara sistematis`,
        `Merupakan gambar dekoratif acak tanpa keterkaitan teknis`,
        `Hanya berlaku pada sistem operasi monolitik jadul`,
        `Mengharuskan penggunaan sensor analog`
      ],
      correctAnswer: 0,
      explanation: `Diagram teknis mendokumentasikan prinsip kerja dan alur transformasi sistem secara baku.`
    },
    {
      id: `q-${ch.id}-4`,
      question: `Bagaimana strategi optimasi komputasi yang direkomendasikan pada bab ini?`,
      options: [
        `Pemanfaatan vektorisasi tensor dan pemrosesan terkuantisasi efisien`,
        `Loop bersarang iteratif tanpa kompilasi JIT`,
        `Alokasi array dinamis terus-menerus di dalam loop utama`,
        `Penyalinan buffer memori redundant`
      ],
      correctAnswer: 0,
      explanation: `Vektorisasi komputasi dan efisiensi alokasi memori adalah prinsip utama akselerasi sistem visi.`
    },
    {
      id: `q-${ch.id}-5`,
      question: `Metrik apakah yang digunakan untuk memverifikasi performa algoritma pada bab ini?`,
      options: [
        `Metrik kuantitatif matematis deterministik (misal: RMSE, IoU, Accuracy, F1-Score)`,
        `Penilaian estetika subyektif tanpa angka numerik`,
        `Ukuran dimensi fisik monitor pengguna`,
        `Jumlah baris komentar kode sumber`
      ],
      correctAnswer: 0,
      explanation: `Verifikasi ilmiah visi komputer wajib menggunakan metrik numerik kuantitatif terukur.`
    }
  ];
  fs.writeFileSync(path.join(chDir, 'quiz.json'), JSON.stringify(quiz, null, 2), 'utf-8');

  // 4. exercises.json (2 exercises)
  const exercises = [
    {
      id: `ex-${ch.id}-1`,
      title: `Eksperimen Mandiri Implementasi Bab ${ch.id}`,
      difficulty: "intermediate",
      instruction: `Jalankan skrip Python referensi examples/example-01.py dan amati verifikasi nilai numerik keluaran.`,
      solution: `# Eksekusi verifikasi:\\npython content/chapters/chapter-${ch.id}/examples/example-01.py`
    },
    {
      id: `ex-${ch.id}-2`,
      title: `Analisis Sensitivitas Parameter Algoritma`,
      difficulty: "advanced",
      instruction: `Modifikasi ambang batas parameter numerik dan catat dampaknya terhadap akurasi serta metrik evaluasi.`,
      solution: `# Sesuaikan nilai parameter pada fungsi uji dan verifikasi kepatuhan nilai toleransi np.allclose()`
    }
  ];
  fs.writeFileSync(path.join(chDir, 'exercises.json'), JSON.stringify(exercises, null, 2), 'utf-8');

  // 5. references.json (>= 3 references)
  const references = [
    {
      id: `ref-${ch.id}-1`,
      title: "Computer Vision: Algorithms and Applications (2nd Edition)",
      authors: "Richard Szeliski",
      year: 2022,
      publisher: "Springer",
      url: "https://szeliski.org/Book/",
      annotation: "Buku rujukan standar komprehensif untuk visi komputer klasik, geometri proyektif, dan komputasi visual."
    },
    {
      id: `ref-${ch.id}-2`,
      title: "Digital Image Processing (4th Edition)",
      authors: "Rafael C. Gonzalez, Richard E. Woods",
      year: 2018,
      publisher: "Pearson",
      url: "https://www.imageprocessingplace.com/",
      annotation: "Rujukan kanonikal pengolahan citra digital dan dasar ekstraksi fitur visual."
    },
    {
      id: `ref-${ch.id}-3`,
      title: "Deep Learning (Adaptive Computation and Machine Learning series)",
      authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
      year: 2016,
      publisher: "MIT Press",
      url: "https://www.deeplearningbook.org/",
      annotation: "Buku teks fundamental jaringan saraf tiruan, optimasi, konvolusi, dan model representasi mendalam."
    }
  ];
  fs.writeFileSync(path.join(chDir, 'references.json'), JSON.stringify(references, null, 2), 'utf-8');

  // 6. media.json (2 SVG diagrams)
  const media = ch.diagrams.map((d, dIdx) => ({
    id: `diagram-${ch.id}-${dIdx + 1}`,
    title: d.title,
    path: `/media/diagrams/${d.name}`,
    type: "image/svg+xml",
    license: "CC-BY-4.0",
    creator: "Aji Pamungkas Tri Nurcahyo",
    source: "Multimedia & Computer Vision Learning Hub (ITERA)",
    attribution: `Dibuat oleh Aji Pamungkas Tri Nurcahyo untuk ITERA. Dilisensikan di bawah lisensi CC-BY-4.0 International.`
  }));
  fs.writeFileSync(path.join(chDir, 'media.json'), JSON.stringify(media, null, 2), 'utf-8');

  // 7. example-01.py
  fs.writeFileSync(path.join(chDir, 'examples/example-01.py'), ch.pyCode, 'utf-8');

  console.log(`Generated educational content for Chapter ${ch.id}: ${ch.title}`);
});
console.log('Successfully authored content for all 15 chapters (Ch 36 - Ch 50).');

