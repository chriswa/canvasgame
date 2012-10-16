for %%a in (*.wav) do "c:\Program Files (x86)\VideoLAN\vlc\vlc.exe" -I dummy -vvv %%a --sout=#transcode{acodec=vorb,ab=128,channels=1}:standard{access=file,mux=ogg,dst=%%a.ogg} vlc://quit


