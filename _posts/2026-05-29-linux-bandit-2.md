---
layout: post
title: "리눅스 기반 시스템 탐색 및 분석 - 2"
date: 2026-05-28
---



level 14 - 15

목표 : 다음 레벨로 가기 위한 비밀번호는 현재 레벨(bandit15)의 비밀번호를 localhost의 30001번 포트로 전송하여 얻을 수 있다. 단, 이번에는 반드시 SSL/TLS 암호화를 사용하여 전송해야 한다.
문제 : 현재 레벨 비밀번호를 localhost의 30001번 포트에 SSL/TLS 암호화를 사용해서 제출하면 다음 레벨 비밀번호를 알려준다.

기본개념 
ssl/tls 
- 데이터를 암호화해서 전송하는 방식
- `openssl s_client` 명령어를 쓴다.

풀이
1. `openssl s_client -connect localhost:30001` 입력
- 암호화된 방식으로 이 서버 3001번 문에 연결
2.
<img width="1040" height="779" alt="Image" src="https://github.com/user-attachments/assets/908f389c-9a11-4e21-abb3-280e65da57f3" />

이런 화면이 뜨고 난 후 비밀번호를 입력한다.













level 15 -16

목표 : 범위 내의 열려 있는 포트를 찾아내는 포트 스캐닝(Port Scanning) 기술과, 보안 통신(SSL/TLS) 여부를 판별하여 정답 서버를 가려내는 종합적인 네트워크 분석 단계.
문제 : 31000~32000번 포트 중에서 서버가 열려있는 포트를 찾고, 그 중에 SSL/TLS 를 쓰는 포트에 비밀번호를 제출하면 다음 레벨 비밀번호를 알려준다. 정답 포트는 딱 1개.

기본 개념

`nmap` 명령어 : 어떤 포트가 열려있는지 스캔해주는 도구이다.
- 31000~32000번 포트 중에 열린 것만 찾아준다.
`openssl s_client` : ssl 암호화 연결 도구
`KEYUPDATE` : 비밀번호를 그냥 돌려보내는 포트
`SSH 개인키` : 비밀번호 대신 파일로 로그인하는 방식

풀이
1. 열린 포트 스캔
- `nmap localhost -p 31000-32000`
- 결과 : 31046, 31518, 31691, 31790, 31960 포트가 열려있음
<img width="973" height="326" alt="Image" src="https://github.com/user-attachments/assets/2cbdbed4-f3ff-4ba6-98e9-7ff91cc404e2" />
2. ssl 포트 찾기 (포트마다 하나씩 시도)
- `openssl s_client -connect localhost:31790 -quiet`
- 연결되면 비밀번호 입력
<img width="973" height="221" alt="Image" src="https://github.com/user-attachments/assets/ab339dc7-f141-40f2-baa6-c7ed94e64c56" />
`-----BEGIN RSA PRIVATE KEY-----` 로 시작하는 개인키가 나온다.

3. ssh 개인키 저장
- `exit` 후 내 ubuntu에서 `nano sshkey17.private`
- 개인키 전체 붙여넣기 후 저장

4. 권한 설정
- `chmod 600 sshkey17.private`

5. bandit17 접속











level 17 - 18

목표 : 두 개의 텍스트 파일을 서로 비교하여 바뀌거나 추가된 부분만 정확하게 찾아내는 방법을 배우기.
문제 : 홈 디렉토리에 passwords.old 와 passwords.new 파일이 있다. passwords.new 에서 변경된 딱 한 줄이 다음 레벨 비밀번호이다.

기본 개념
`diff` 명령어 : 두 파일을 비교해서 다른 부분을 보여주는 명령어
ex) 파일 100줄 중 1줄만 바뀌었으면 그 줄만 보여준다.

풀이
1. bandit17접속된 상태에서 `diff passwords.old passwords.new` 입력
2. 결과에서 
- `<`로 시작하는 줄 = passwords.old 내용(옛날 비밀번호)
- `>`로 시작하는 줄 = passwords.new 내용(새 비밀번호)
<img width="753" height="156" alt="Image" src="https://github.com/user-attachments/assets/f28b4b10-db56-47fe-9779-53ecb929241c" />











level 18 - 19

목표 : 리눅스의 사용자가 로그인할 때 자동으로 실행되는 환경 설정 파일(.bashrc)의 허점을 우회하여, 정상적인 쉘 로그인 없이 서버의 명령어를 실행하는 방법을 배우기.
문제 : 비밀번호는 홈 디렉토리의 readme 파일에 있다. 근데 누군가 .bashrc 파일을 수정해서 SSH로 접속하면 바로 로그아웃 되게 해놓은 상태.

기본 개념
`.bashre` : 터미널 접속할 때 자동으로 실행되는 설정파일
- 누군가 여기에 "접속하면 바로나가" 를 넣어놓았다.
- 해결 방법 : ssh 접속할 때 바로 명령어를 실행한다. ( 로그아웃 되기 전에 명령어 실행 )

풀이
`ssh bandit18@bandit.labs.overthewire.org -p 2220 "cat readme"`
입력하면 바로 readme 내용이 출력된다.













level 19 - 20 

목표 : 리눅스 시스템 보안과 권한 관리에서 핵심적인 개념인 SetUID(정수 ID 설정) 바이너리를 다루는 단계
문제 : 홈 디렉토리에 setuid 바이너리 파일이 있다. 그걸 실행해서 사용법을 확인하고, /etc/bandit_pass 에서 비밀번호를 찾으시오.

기본 개념
`setuid` : 특정 파일을 실행할 때 다른 유저의 권환으로 실행할 수 있게 해주는 기능
ex) bandit19가 이 파일을 실행하면 bandit20의 권한으로 명령어를 실행할 수 있다.

풀이
1. 파일 확인
`ls`
<img width="923" height="148" alt="Image" src="https://github.com/user-attachments/assets/fb4fa2c6-e7ca-40b5-9567-0dc3c4498dde" />
bandit20-do 파일이 있는 것을 확인.
2. bandit20-do 파일을 `./bandit20-do cat /etc/bandit_pass/bandit20` 로 읽는다.








level 20 - 21

목표 : SetUID 바이너리 개념에 네트워크 통신(포트 연결)과 리눅스의 백그라운드 작업 제어(Job Control) 기술을 조합해야 하는  단계
문제 : 홈 디렉토리에 setuid 바이너리가 있다. 이 프로그램은 내가 지정한 포트로 localhost에 연결해서 비밀번호를 확인하고, 맞으면 다음 레벨 비밀번호를 주는 문제이다.

문제의 흐름
1. 내가 먼저 특정 포트를 열어서 대기한다. ( 서버 역할 )
2. setuid 바이너리가 그 포트에 접속한다. ( 클라이언트 역할 )
3. 바이너리가 비밀번호 맞는지 확인 후 다음 비밀번호를 준다.

기본 개념
`&` : 명령어를 백그라운드에서 실행해준다. ( 동시에 두가지 실행 가능 )

풀이
1. 포트 열어서 비밀번호 전송 후 대기 (백그라운드)
`echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -lp 1234 &`
<img width="1020" height="102" alt="Image" src="https://github.com/user-attachments/assets/871d3dee-a90f-4e6f-8b22-bfd6ba6f2d77" />
2. setuid 바이너리로 그 포트에 접속
`./suconnect 1234`









level 21 - 22
목표 : 정기 예약 작업 스케줄러 cron (크론)을 배우기. 시스템이 보이지 않는 곳에서 주기적으로 어떤 일을 처리하는지 추적하는 단계이다.
문제 : cron 이라는 자동 실행 스케줄러가 주기적으로 어떤 프로그램을 실행하고 있다. /etc/cron.d/ 폴더를 확인해서 어떤 명령어가 실행되는지 찾아라.

기본 개념 
`cron` : 리눅스에서 특정 시간마다 자동으로 실행되는 스케줄러
ex) 매일 밤 12시에 이 명령어 실행해줘

풀이 
1. cron 설정 파일 확인
`ls /etc/cron.d/`
<img width="950" height="131" alt="Image" src="https://github.com/user-attachments/assets/d533fb55-1918-4339-80b7-753a20b7fd22" />
2. bandit22관련 파일 읽기
<img width="878" height="95" alt="Image" src="https://github.com/user-attachments/assets/e1b8a2a7-54df-4703-86c1-7c54d2b85ee7" />
3. 실행되는 스크립트 읽기 ( 스크립트 경로가 나오면 그걸 cat 으로 읽는다. )
`cat /usr/bin/cronjob_bandit22.sh`
4. cat 으로 `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv` 파일을 읽는다.
<img width="989" height="125" alt="Image" src="https://github.com/user-attachments/assets/285cf294-819a-4ccb-a26f-ac04e429d554" />












level 22 - 23

목표 : 다른 사람이 작성한 쉘 스크립트(Shell Script)를 한 줄 한 줄 분석하고 이해하는 역량을 요구
문제 : cron 스케줄러가 실행하는 프로그램이 있다. /etc/cron.d/ 를 확인하고, 다른 사람이 작성한 쉘 스크립트를 읽어라.

풀이
1. cron 설정 확인
`cat /etc/cron.d/cronjob_bandit23`
<img width="907" height="118" alt="Image" src="https://github.com/user-attachments/assets/d0cd8b04-fb52-44e3-9718-fb456d5e6e66" />
2. 스크립트 읽기
`cat /usr/bin/cronjob_bandit23.sh`
<img width="1001" height="256" alt="Image" src="https://github.com/user-attachments/assets/d10982f4-15b5-4ecb-9406-953e11c2c8a0" />
`myname=$(whoami)`
- 현재 유저 이름 저장, 이 스크립트는 bandit23으로 실행되니까 myname=bandit23
`mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)`
- "I am user bandit23" 을 md5 암호화해서 파일 이름으로 쓴다.
- `cat /etc/bandit_pass/$myname > /tmp/$mytarget`
bandit23 비밀번호를 /tmp/암호화된이름 파일에 저장한다.
3. 파일 이름 계산
`echo I am user bandit23 | md5sum | cut -d ' ' -f 1`
<img width="1001" height="67" alt="Image" src="https://github.com/user-attachments/assets/e0b4e510-fda0-43fd-9bf7-116844341faa" />
4. cat 으로 `8ca319486bfbbc3663ea0fbe81326349` 파일 읽기
`cat /tmp/8ca319486bfbbc3663ea0fbe81326349`












level 23 - 24

목표 : 내가 직접 쉘 스크립트(공격 코드)를 작성해서 시스템이 자동으로 실행하도록 주입하는 단계
문제 : cron이 자동으로 실행하는 프로그램이 있어요. 이번엔 직접 쉘 스크립트를 만들어라.

기본 개념
쉘 스크립트 : 명령어들을 파일에 저장해서 한 번에 실행하는 것
ex) cat, ls 같은 명령어를 파일에 써놓으면 자동으로 실행된다.

풀이
1. cron 설정 확인
`cat /etc/cron.d/cronjob_bandit24`
<img width="868" height="111" alt="Image" src="https://github.com/user-attachments/assets/f50b1e95-15b8-459b-b715-88c9bc1e80ef" />
2. 스크립트 확인
`cat /usr/bin/cronjob_bandit24.sh`
<img width="969" height="564" alt="Image" src="https://github.com/user-attachments/assets/2a19eccf-d01a-425b-ba4c-e1d7a093202b" />
- 이 스크립트가 하는 일
`/var/spool/bandit24/foo` 폴더에 있는 파일들을 실행
bandit23이 만든 파일이면 실행하고 삭제

3. 작업 폴더 만들기
`mkdir /tmp/mywork23`

4. 스크립트 파일 만들기
- `nano /tmp/mywork23/myscript.sh`
- nano 열리면 이 내용 입력
`#!/bin/bash`
`cat /etc/bandit_pass/bandit24 > /tmp/mywork23/password.txt`
<img width="1065" height="940" alt="Image" src="https://github.com/user-attachments/assets/91db3849-1737-4827-8c55-ad8fb24bd9d3" />
5. 실행 권한 주기
`chmod 777 /tmp/mywork23/myscript.sh`
`chmod 777 /tmp/mywork23`

6. cron 폴더에 복사
`cp /tmp/mywork23/myscript.sh /var/spool/bandit24/foo/`

7. 비밀번호 확인
`cat /tmp/mywork23/password.txt`












level 24 - 25

목표 : 무차별 대입 공격(Brute-Forcing)을 배우는 단계, 컴퓨터의 빠른 연산 속도를 이용해 모든 경우의 수를 찍어 맞추는 자동화 스크립트를 작성.
문제 : 30002번 포트에 서버가 있다. bandit24 비밀번호 + 4자리 숫자 핀코드를 보내면 다음 레벨 비밀번호를 준다. 핀코드는 0000~9999 중 하나인데, 전부 다 시도(브루트포스) 해야 한다.

기본 개념
브루트포스 : 가능한 모든 경우의 수를 하나씩 다 시도하는 방법

풀이
1. 작업 폴더 만들기
`mkdir /tmp/brute24`

2. 모든 핀코드 조합 파일 만들기
`for i in $(seq 0000 9999); do echo "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 $(printf '%04d' $i)"; done > /tmp/brute24/attempts.txt`
2-1. `for i in $(seq 0000 9999)` 
- `seq 0000 9999` : 0부터 9999까지 숫자를 만들어줘
- `for i in` = 그 숫자를 하나씩 i 에 넣어서 반복해줘
2-2. `do echo "비밀번호 $(printf '%04d' $i)"`
- `echo` = 이 텍스트를 출력해줘
- `printf '%04d' $i` = 숫자를 4자리로 만들어줘
2-3. `done` : 끝
2-4. `> /tmp/brute24/attempts.txt` : 결과를 파일에 저장해줘

3. 한번에 전송해서 정답 찾기
`cat /tmp/brute24/attempts.txt | nc localhost 30002 | grep -v Wrong`
