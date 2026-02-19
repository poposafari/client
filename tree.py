import sys
from pathlib import Path

# ==========================================
# ⚙️ 설정값
# ==========================================
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', '.DS_Store', '.venv', 'dist'}
TOTAL_FILES = 0  # 총 파일 개수 누적
TOTAL_SIZE = 0   # 총 용량 누적 (Bytes)
# ==========================================

def format_size(size_bytes: int) -> str:
    """
    바이트 크기를 사람이 읽기 편한 단위(B, KB, MB, GB)로 변환합니다.
    """
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = 0
    p = float(size_bytes)
    while p >= 1024 and i < len(size_name) - 1:
        p /= 1024
        i += 1
    return f"{p:.1f}{size_name[i]}"

def get_dir_stats(directory: Path):
    """
    해당 디렉토리 직계(1 depth) 파일들의 개수와 총 용량을 계산합니다.
    (하위 폴더의 크기는 포함하지 않고, 해당 폴더에 있는 파일들만 계산)
    """
    count = 0
    size = 0
    try:
        for item in directory.iterdir():
            if item.is_file() and not item.name.startswith('.'):
                count += 1
                size += item.stat().st_size
    except (PermissionError, FileNotFoundError):
        pass
    return count, size

def print_tree(directory: Path, padding: str = ""):
    global TOTAL_FILES, TOTAL_SIZE
    
    try:
        # 디렉터리만 가져오기 + 정렬
        subdirs = sorted([
            item for item in directory.iterdir() 
            if item.is_dir() and item.name not in IGNORE_DIRS and not item.name.startswith('.')
        ], key=lambda x: x.name.lower())
    except PermissionError:
        return

    count = len(subdirs)
    for index, subdir in enumerate(subdirs):
        is_last = (index == count - 1)
        connector = "└── " if is_last else "├── "
        
        # 📂 현재 폴더 통계 계산 (파일 개수, 용량)
        file_count, dir_size = get_dir_stats(subdir)
        
        # [누적] 전역 변수에 더하기
        TOTAL_FILES += file_count
        TOTAL_SIZE += dir_size
        
        # 출력 포맷: 폴더이름 (개수, 용량)
        formatted_size = format_size(dir_size)
        print(f"{padding}{connector}{subdir.name} ({file_count} files, {formatted_size})")
        
        # 재귀 호출
        next_padding = padding + ("    " if is_last else "│   ")
        print_tree(subdir, next_padding)

def main():
    global TOTAL_FILES, TOTAL_SIZE
    
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    root_path = Path(target)
    
    if not root_path.exists():
        print(f"❌ 경로를 찾을 수 없습니다: {target}")
        return

    # 1. 루트 폴더의 통계 계산 및 누적
    root_count, root_size = get_dir_stats(root_path)
    TOTAL_FILES += root_count
    TOTAL_SIZE += root_size

    # 2. 루트 폴더 이름 출력
    print(f"{root_path.name or target} ({root_count} files, {format_size(root_size)})")
    
    # 3. 트리 출력 시작
    print_tree(root_path)

    # 4. ✨ 하단 총계 출력 ✨
    print("-" * 40)
    print(f"📊 Total Files : {TOTAL_FILES:,}")
    print(f"💾 Total Size  : {format_size(TOTAL_SIZE)}")
    print("-" * 40)

if __name__ == "__main__":
    main()