
# Template version
VERSION="2"

# Parameters
ONBOOT="{{ onboot }}"
BOOTORDER="{{ bootorder }}"

# VSwap requires RAM and SWAP, all other memory parameters are optional.
<tmpl_if name='physpages'>
# RAM
PHYSPAGES="{{ physpages }}"
</tmpl_if>
<tmpl_if name='swappages'>
# SWAP
SWAPPAGES="{{ swappages }}"
</tmpl_if>

<tmpl_if name='kmemsize'>
KMEMSIZE="{{ kmemsize }}"
</tmpl_if>
<tmpl_if name='lockedpages'>
LOCKEDPAGES="{{ lockedpages }}"
</tmpl_if>
<tmpl_if name='privvmpages'>
PRIVVMPAGES="{{ privvmpages }}"
</tmpl_if>
<tmpl_if name='shmpages'>
SHMPAGES="{{ shmpages }}"
</tmpl_if>
<tmpl_if name='vmguarpages'>
VMGUARPAGES="{{ vmguarpages }}"
</tmpl_if>
<tmpl_if name='oomguarpages'>
OOMGUARPAGES="{{ oomguarpages }}"
</tmpl_if>
# alternative meminfo: "pages:256000"
MEMINFO="privvmpages:1"

<tmpl_if name='vmguarpages'>
NUMPROC="{{ numproc }}"
</tmpl_if>
<tmpl_if name='numtcpsock'>
NUMTCPSOCK="{{ numtcpsock }}"
</tmpl_if>
<tmpl_if name='numflock'>
NUMFLOCK="{{ numflock }}"
</tmpl_if>
<tmpl_if name='numpty'>
NUMPTY="{{ numpty }}"
</tmpl_if>
<tmpl_if name='numsiginfo'>
NUMSIGINFO="{{ numsiginfo }}"
</tmpl_if>
<tmpl_if name='tcpsndbuf'>
TCPSNDBUF="{{ tcpsndbuf }}"
</tmpl_if>
<tmpl_if name='tcprcvbuf'>
TCPRCVBUF="{{ tcprcvbuf }}"
</tmpl_if>
<tmpl_if name='othersockbuf'>
OTHERSOCKBUF="{{ othersockbuf }}"
</tmpl_if>
<tmpl_if name='dgramrcvbuf'>
DGRAMRCVBUF="{{ dgramrcvbuf }}"
</tmpl_if>
<tmpl_if name='numothersock'>
NUMOTHERSOCK="{{ numothersock }}"
</tmpl_if>
<tmpl_if name='dcachesize'>
DCACHESIZE="{{ dcachesize }}"
</tmpl_if>
<tmpl_if name='numfile'>
NUMFILE="{{ numfile }}"
</tmpl_if>
<tmpl_if name='avnumproc'>
AVNUMPROC="{{ avnumproc }}"
</tmpl_if>
<tmpl_if name='numiptent'>
NUMIPTENT="{{ numiptent }}"
</tmpl_if>

DISKSPACE="{{ diskspace }}"
DISKINODES="{{ diskinodes }}"
QUOTAUGIDLIMIT="10000"
QUOTATIME="0"
<tmpl_if name='io_priority'>
IOPRIO="{{ io_priority }}"
</tmpl_if>

<tmpl_if name='cpu_num'>
CPUS="{{ cpu_num }}"
</tmpl_if>
<tmpl_if name='cpu_units'>
CPUUNITS="{{ cpu_units }}"
</tmpl_if>
<tmpl_if name='cpu_limit'>
CPULIMIT="{{ cpu_limit }}"
</tmpl_if>

VE_ROOT="/vz/root/$VEID"
VE_PRIVATE="/vz/private/$VEID"
OSTEMPLATE="{{ ostemplate }}"
ORIGIN_SAMPLE="vps.basic"
HOSTNAME="{{ hostname }}"
IP_ADDRESS="{{ ip_address }}"
NAMESERVER="{{ nameserver }}"

<tmpl_if name='capability'>
CAPABILITY="{{ capability }}"
</tmpl_if>
<tmpl_if name='features'>
FEATURES="{{ features }}"
</tmpl_if>
<tmpl_if name='iptables'>
IPTABLES="{{ iptables }}"
</tmpl_if>
<tmpl_if name='custom'>
{{ custom }}
</tmpl_if>
