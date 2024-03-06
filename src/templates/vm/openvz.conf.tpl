
# Template version
VERSION="2"

# Parameters
ONBOOT="{{ onboot }}"
BOOTORDER="{{ bootorder }}"

# VSwap requires RAM and SWAP, all other memory parameters are optional.
{% if physpages %}
# RAM
PHYSPAGES="{{ physpages }}"
{% endif %}
{% if swappages %}
# SWAP
SWAPPAGES="{{ swappages }}"
{% endif %}

{% if kmemsize %}
KMEMSIZE="{{ kmemsize }}"
{% endif %}
{% if lockedpages %}
LOCKEDPAGES="{{ lockedpages }}"
{% endif %}
{% if privvmpages %}
PRIVVMPAGES="{{ privvmpages }}"
{% endif %}
{% if shmpages %}
SHMPAGES="{{ shmpages }}"
{% endif %}
{% if vmguarpages %}
VMGUARPAGES="{{ vmguarpages }}"
{% endif %}
{% if oomguarpages %}
OOMGUARPAGES="{{ oomguarpages }}"
{% endif %}
# alternative meminfo: "pages:256000"
MEMINFO="privvmpages:1"

{% if vmguarpages %}
NUMPROC="{{ numproc }}"
{% endif %}
{% if numtcpsock %}
NUMTCPSOCK="{{ numtcpsock }}"
{% endif %}
{% if numflock %}
NUMFLOCK="{{ numflock }}"
{% endif %}
{% if numpty %}
NUMPTY="{{ numpty }}"
{% endif %}
{% if numsiginfo %}
NUMSIGINFO="{{ numsiginfo }}"
{% endif %}
{% if tcpsndbuf %}
TCPSNDBUF="{{ tcpsndbuf }}"
{% endif %}
{% if tcprcvbuf %}
TCPRCVBUF="{{ tcprcvbuf }}"
{% endif %}
{% if othersockbuf %}
OTHERSOCKBUF="{{ othersockbuf }}"
{% endif %}
{% if dgramrcvbuf %}
DGRAMRCVBUF="{{ dgramrcvbuf }}"
{% endif %}
{% if numothersock %}
NUMOTHERSOCK="{{ numothersock }}"
{% endif %}
{% if dcachesize %}
DCACHESIZE="{{ dcachesize }}"
{% endif %}
{% if numfile %}
NUMFILE="{{ numfile }}"
{% endif %}
{% if avnumproc %}
AVNUMPROC="{{ avnumproc }}"
{% endif %}
{% if numiptent %}
NUMIPTENT="{{ numiptent }}"
{% endif %}

DISKSPACE="{{ diskspace }}"
DISKINODES="{{ diskinodes }}"
QUOTAUGIDLIMIT="10000"
QUOTATIME="0"
{% if io_priority %}
IOPRIO="{{ io_priority }}"
{% endif %}

{% if cpu_num %}
CPUS="{{ cpu_num }}"
{% endif %}
{% if cpu_units %}
CPUUNITS="{{ cpu_units }}"
{% endif %}
{% if cpu_limit %}
CPULIMIT="{{ cpu_limit }}"
{% endif %}

VE_ROOT="/vz/root/$VEID"
VE_PRIVATE="/vz/private/$VEID"
OSTEMPLATE="{{ ostemplate }}"
ORIGIN_SAMPLE="vps.basic"
HOSTNAME="{{ hostname }}"
IP_ADDRESS="{{ ip_address }}"
NAMESERVER="{{ nameserver }}"

{% if capability %}
CAPABILITY="{{ capability }}"
{% endif %}
{% if features %}
FEATURES="{{ features }}"
{% endif %}
{% if iptables %}
IPTABLES="{{ iptables }}"
{% endif %}
{% if custom %}
{{ custom }}
{% endif %}
