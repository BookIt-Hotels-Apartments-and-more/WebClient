function WizardProgress({ current }) {
    const labels = ["Property name","Location","Details","Description","Photos","Publication"];
    const pct = Math.round((current / labels.length) * 100);
    return (
        <div className="mb-4" style={{marginTop: 100}}>
            <div className="d-flex justify-content-between mb-2">
                {labels.map((l, i) => (
                    <div
                        key={l}
                        className="text-muted"
                        style={{
                            fontSize: 13,
                            width: `${100/labels.length}%`,
                            textAlign: i === 0
                                ? "left"
                                : i === labels.length - 1
                                    ? "right"
                                    : "center"}}
                    >
                        {l}
                    </div>
                ))}
            </div>
            <div
                className="progress"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{height: 8}}
            >
                <div className="progress-bar" style={{width: `${pct}%`}}/>
            </div>
        </div>
    );
}

export default WizardProgress;