import React from 'react';
import { ProgressCircle } from '@adobe/react-spectrum';


export default function CommerceLoader({ size = "S" }) {
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <ProgressCircle size={size} aria-label="Loading…" isIndeterminate />
        </div>
    )
}
