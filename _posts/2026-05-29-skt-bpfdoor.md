---
layout: post
title: "SKT 유심 해킹 — BPFDoor 백도어 공격"
date: 2026-05-29 00:00:00 +0900
---

## 개요

2025년 4월 18일, SK텔레콤의 이동통신 가입자 인증 서버인 HSS(Home Subscriber Server)에서
약 9.82GB 규모의 개인정보가 외부로 유출됐다.
피해 규모는 최대 2,300만 가입자의 유심 인증 정보에 달했고,
개인정보보호위원회는 역대 최대 규모인 1,348억 원의 과징금을 부과했다.

---

## BPFDoor란?

BPFDoor는 BPF(Berkeley Packet Filter)를 악용하는 리눅스 기반 백도어 악성코드다.
BPF는 운영체제 가상머신에서 코드를 실행하는 기술로, 커널 단에서 동작하기 때문에
네트워크 방화벽이나 탐지 시스템을 완전히 우회할 수 있다.

### 공격 흐름

1. 초기 침투
2. BPFDoor 설치 (리눅스 커널 레벨 → 보안 솔루션 우회)
3. 은닉 통신
4. 데이터 탈취

1. BPF : BPF(Berkeley Packet Filter)는 원래 1992년에 만들어진 정상적인 리눅스 커널 기술이다.
tcpdump, Wireshark 같은 네트워크 분석 도구들이 전부 BPF를 써서 패킷을 캡처한다.
문제는 이 기술이 커널에서 가장 먼저 패킷을 보는 위치에 있다는 것. BPFDoor는 이 정상 기술을 백도어 통신 채널로 악용한 것이다.
<img width="1109" height="741" alt="Image" src="https://github.com/user-attachments/assets/59dc6d1e-d97d-4cd5-bd12-05d7db47764b" />
---

## BPFDoor 핵심 원리

### 1. BPF 기술 악용

BPF(Berkeley Packet Filter)는 원래 1992년에 만들어진 정상적인 리눅스 커널 기술이다.
tcpdump, Wireshark 같은 네트워크 분석 도구들이 전부 BPF를 써서 패킷을 캡처한다.
문제는 이 기술이 커널에서 **가장 먼저 패킷을 보는 위치**에 있다는 것.
BPFDoor는 이 정상 기술을 백도어 통신 채널로 악용한 것이다.

### 2. 매직 패킷 — 핵심 트릭

BPFDoor는 평소엔 완전히 침묵한다.
열린 포트도 없고, 네트워크 연결도 없고, 프로세스 목록에도 안 보인다.
딱 하나의 조건(매직 패킷)이 충족될 때만 깨어난다.

```c
// 일반 백도어 방식 — 소켓 열고 포트 Listen
int sock = socket(AF_INET, SOCK_STREAM, 0);
bind(sock, &addr, sizeof(addr));   // 포트 4444 열림 → netstat에 보임
listen(sock, 5);

// BPFDoor 방식 — 커널 레이어에서 직접 패킷 캡처
int sock = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
// 포트를 열지 않고 NIC에서 바로 모든 패킷을 훔쳐봄
// netstat, ss 어디에도 안 보임
```

### 3. BPF 필터로 매직 바이트만 골라내기

```c
struct sock_filter filter[] = {
    // ICMP 패킷인지 확인
    BPF_STMT(BPF_LD | BPF_B | BPF_ABS, 23),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, IPPROTO_ICMP, 0, 3),
    // 매직 바이트 0x5293 있는지 확인
    BPF_STMT(BPF_LD | BPF_H | BPF_ABS, 54),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, 0x5293, 0, 1),
    BPF_STMT(BPF_RET | BPF_K, 0xFFFF), // 통과 → BPFDoor 깨어남
    BPF_STMT(BPF_RET | BPF_K, 0),      // 나머지 → 무시
};
// 이 필터가 커널 안에서 동작 → 사용자 공간 어떤 도구도 볼 수 없음
```

### 4. 프로세스명 위장

```c
// argv[0]을 덮어써서 ps 명령에 다른 이름으로 표시
strcpy(argv[0], "/usr/bin/dbus-daemon");
// 실제로는 악성코드인데 ps 결과엔 정상 시스템 프로세스처럼 보임
```

---

## 해킹 원리 분석

### 1. 초기 침투 — 웹셸 & VPN 취약점

민관합동조사단은 BPFDoor 외에도 웹셸 악성코드를 추가로 발견했으며,
이것이 2022년 최초 공격의 핵심 수단이었을 것으로 추정된다.
전문가들은 Ivanti의 VPN 장비 취약점을 통해 최초 해킹이 이뤄졌을 것으로 본다.

### 2. BPFDoor의 핵심 원리 — 왜 못 잡았나

BPF는 운영체제가 패킷을 처리하기 전, NIC(네트워크 인터페이스 카드)에서
**가장 먼저 패킷을 가로채는 커널 수준 기능**이다.
이 덕분에 BPFDoor는 방화벽이나 소켓 열림 여부와 무관하게
네트워크를 직접 들여다보고 데이터를 주고받을 수 있다.

### 3. 탈취 목표 — 왜 HSS였나

HSS(Home Subscriber Server)는 SKT 가입자가 네트워크에 접속할 때
본인인지 인증하는 핵심 정보를 저장하는 시스템이다.
해커가 노린 정보는 **유심 인증키(Ki 값)** 였다.

> Ki 값을 확보하면 통신망 조작, 스푸핑, 위치 추적, 금융 범죄까지 가능하다.
