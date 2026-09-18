from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import numpy as np


app = FastAPI(
    title="Certify AI Fraud Detection Service",
    version="1.0.0"
)


# ---------------------------------------------------------------------------
# Request Model
# ---------------------------------------------------------------------------

class VerificationBehavior(BaseModel):
    total_attempts: int
    successful_attempts: int
    failed_attempts: int
    revoked_attempts: int
    recent_attempts: int
    unique_days: int
    average_interval_seconds: float


# ---------------------------------------------------------------------------
# Normal Verification Behavior
#
# These examples represent normal certificate verification activity.
# The Isolation Forest learns the general shape of normal behavior.
# ---------------------------------------------------------------------------

NORMAL_BEHAVIOR = np.array([
    # total, successful, failed, revoked, recent, days, avg interval
    [1, 1, 0, 0, 1, 1, 0],
    [2, 2, 0, 0, 1, 1, 120],
    [2, 2, 0, 0, 1, 2, 86400],
    [3, 3, 0, 0, 1, 2, 3600],
    [3, 3, 0, 0, 2, 2, 1800],
    [4, 4, 0, 0, 1, 3, 7200],
    [5, 5, 0, 0, 2, 3, 3600],
    [5, 5, 0, 0, 1, 4, 14400],
    [6, 6, 0, 0, 2, 4, 7200],
    [7, 7, 0, 0, 2, 5, 10800],
    [8, 8, 0, 0, 2, 5, 14400],
    [10, 10, 0, 0, 3, 7, 21600],

    # Slightly unusual but still potentially normal
    [10, 9, 1, 0, 4, 5, 1800],
    [12, 11, 1, 0, 4, 7, 3600],
    [15, 14, 1, 0, 5, 8, 7200],
])


# ---------------------------------------------------------------------------
# Isolation Forest Model
# ---------------------------------------------------------------------------

model = IsolationForest(
    n_estimators=200,
    contamination=0.12,
    random_state=42
)

model.fit(NORMAL_BEHAVIOR)


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

def calculate_rule_score(data: VerificationBehavior):
    """
    Calculates a behavioral risk score using explicit fraud/anomaly rules.
    """

    score = 0
    anomalies = []

    total = data.total_attempts
    failed = data.failed_attempts
    revoked = data.revoked_attempts
    recent = data.recent_attempts
    unique_days = data.unique_days
    avg_interval = data.average_interval_seconds

    # -----------------------------------------------------------------------
    # Rule 1: Very high total verification activity
    # -----------------------------------------------------------------------

    if total >= 30:
        score += 35
        anomalies.append(
            "Extremely high number of verification attempts detected"
        )

    elif total >= 20:
        score += 25
        anomalies.append(
            "Unusually high number of verification attempts"
        )

    elif total >= 10:
        score += 10
        anomalies.append(
            "Higher than normal verification activity detected"
        )

    # -----------------------------------------------------------------------
    # Rule 2: Failed verification attempts
    # -----------------------------------------------------------------------

    if failed >= 10:
        score += 35
        anomalies.append(
            "Large number of failed verification attempts detected"
        )

    elif failed >= 5:
        score += 25
        anomalies.append(
            "Multiple failed verification attempts detected"
        )

    elif failed >= 2:
        score += 10
        anomalies.append(
            "Repeated failed verification attempts detected"
        )

    # -----------------------------------------------------------------------
    # Rule 3: Revoked certificate activity
    # -----------------------------------------------------------------------

    if revoked >= 5:
        score += 40
        anomalies.append(
            "Repeated verification attempts involving revoked certificates"
        )

    elif revoked >= 2:
        score += 25
        anomalies.append(
            "Multiple verification attempts involving a revoked certificate"
        )

    elif revoked == 1:
        score += 10
        anomalies.append(
            "Verification attempt involving a revoked certificate detected"
        )

    # -----------------------------------------------------------------------
    # Rule 4: Very high recent activity
    # -----------------------------------------------------------------------

    if recent >= 20:
        score += 35
        anomalies.append(
            "Extremely high verification activity in a short period"
        )

    elif recent >= 10:
        score += 25
        anomalies.append(
            "Unusually high verification activity in a short period"
        )

    elif recent >= 5:
        score += 15
        anomalies.append(
            "Repeated verification activity detected recently"
        )

    # -----------------------------------------------------------------------
    # Rule 5: High failure ratio
    # -----------------------------------------------------------------------

    if total > 0:
        failure_ratio = failed / total

        if failure_ratio >= 0.75 and failed >= 3:
            score += 30
            anomalies.append(
                "Very high proportion of verification attempts failed"
            )

        elif failure_ratio >= 0.50 and failed >= 3:
            score += 20
            anomalies.append(
                "High proportion of verification attempts failed"
            )

    # -----------------------------------------------------------------------
    # Rule 6: Extremely rapid repeated verification
    # -----------------------------------------------------------------------

    if total >= 5 and 0 < avg_interval < 15:
        score += 30
        anomalies.append(
            "Verification attempts are occurring unusually rapidly"
        )

    elif total >= 5 and 0 < avg_interval < 30:
        score += 20
        anomalies.append(
            "Rapid repeated verification attempts detected"
        )

    # -----------------------------------------------------------------------
    # Rule 7: Many attempts on a single day
    # -----------------------------------------------------------------------

    if unique_days == 1 and total >= 20:
        score += 25
        anomalies.append(
            "Large number of verification attempts concentrated on one day"
        )

    elif unique_days == 1 and total >= 10:
        score += 10
        anomalies.append(
            "Verification activity is concentrated on a single day"
        )

    return min(score, 100), anomalies


def get_ml_anomaly_score(data: VerificationBehavior):
    """
    Runs Isolation Forest against the learned normal verification behavior.
    """

    features = np.array([[
        data.total_attempts,
        data.successful_attempts,
        data.failed_attempts,
        data.revoked_attempts,
        data.recent_attempts,
        data.unique_days,
        data.average_interval_seconds
    ]])

    prediction = model.predict(features)[0]

    decision_score = float(model.decision_function(features)[0])

    return prediction, decision_score


def analyze_behavior(data: VerificationBehavior):
    """
    Main AI analysis.
    """

    # -----------------------------------------------------------------------
    # Basic validation
    # -----------------------------------------------------------------------

    if data.total_attempts < 0:
        data.total_attempts = 0

    if data.successful_attempts < 0:
        data.successful_attempts = 0

    if data.failed_attempts < 0:
        data.failed_attempts = 0

    if data.revoked_attempts < 0:
        data.revoked_attempts = 0

    if data.recent_attempts < 0:
        data.recent_attempts = 0

    if data.unique_days < 0:
        data.unique_days = 0

    if data.average_interval_seconds < 0:
        data.average_interval_seconds = 0

    # -----------------------------------------------------------------------
    # Very small history handling
    #
    # This is important.
    #
    # A certificate that has only been verified once or twice does not have
    # enough behavioral history to confidently classify the activity as fraud.
    # -----------------------------------------------------------------------

    if data.total_attempts <= 2:

        # A clean first/second verification is treated as LOW risk.
        if (
            data.failed_attempts == 0
            and data.revoked_attempts == 0
        ):

            return {
                "risk_score": 5.0,
                "risk_level": "LOW",
                "is_anomaly": False,
                "ml_anomaly_score": None,
                "anomalies": [],
                "summary": (
                    "Insufficient verification history for behavioral "
                    "anomaly detection. Certificate verification appears normal."
                ),
                "model": "Isolation Forest",
            }

    # -----------------------------------------------------------------------
    # Rule-based analysis
    # -----------------------------------------------------------------------

    rule_score, rule_anomalies = calculate_rule_score(data)

    # -----------------------------------------------------------------------
    # Machine-learning analysis
    # -----------------------------------------------------------------------

    prediction, ml_score = get_ml_anomaly_score(data)

    ml_anomaly = prediction == -1

    # -----------------------------------------------------------------------
    # Convert Isolation Forest result into a contribution to risk score.
    #
    # A less negative decision score indicates behavior farther from the
    # learned normal region.
    # -----------------------------------------------------------------------

    ml_risk = 0

    if ml_anomaly:

        if ml_score < -0.10:
            ml_risk = 35

        elif ml_score < -0.05:
            ml_risk = 25

        else:
            ml_risk = 15

        if not rule_anomalies:
            rule_anomalies.append(
                "Verification behavior differs significantly from the learned normal pattern"
            )

    # -----------------------------------------------------------------------
    # Combined score
    # -----------------------------------------------------------------------

    risk_score = min(
        100,
        rule_score + ml_risk
    )

    # -----------------------------------------------------------------------
    # Prevent isolated ML false positives when behavior is clearly normal.
    # -----------------------------------------------------------------------

    if (
        data.total_attempts <= 5
        and data.failed_attempts == 0
        and data.revoked_attempts == 0
        and data.recent_attempts <= 2
    ):

        risk_score = min(risk_score, 15)

        # Remove a weak ML-only anomaly.
        if rule_score == 0:
            rule_anomalies = []

    # -----------------------------------------------------------------------
    # Determine risk level
    # -----------------------------------------------------------------------

    if risk_score >= 70:
        risk_level = "HIGH"

    elif risk_score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # -----------------------------------------------------------------------
    # Determine anomaly status
    # -----------------------------------------------------------------------

    is_anomaly = (
        risk_level in ["MEDIUM", "HIGH"]
        and len(rule_anomalies) > 0
    )

    # -----------------------------------------------------------------------
    # Generate explanation
    # -----------------------------------------------------------------------

    if risk_level == "LOW":

        summary = (
            "Verification behavior appears normal. "
            "No significant anomalous activity was detected."
        )

    elif risk_level == "MEDIUM":

        summary = (
            f"{len(rule_anomalies)} anomalous verification pattern(s) detected. "
            "Additional monitoring may be appropriate."
        )

    else:

        summary = (
            f"{len(rule_anomalies)} significant anomalous verification "
            "pattern(s) detected. The activity requires attention."
        )

    return {
        "risk_score": float(round(risk_score, 2)),
        "risk_level": risk_level,
        "is_anomaly": bool(is_anomaly),
        "ml_anomaly_score": float(round(ml_score, 4)),
        "anomalies": [str(item) for item in rule_anomalies],
        "summary": summary,
        "model": "Isolation Forest",
    }


# ---------------------------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Certify AI Fraud Detection Service is running",
        "model": "Isolation Forest"
    }


# ---------------------------------------------------------------------------
# Health Endpoint
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "model": "Isolation Forest"
    }


# ---------------------------------------------------------------------------
# Analyze Endpoint
# ---------------------------------------------------------------------------

@app.post("/analyze")
def analyze(data: VerificationBehavior):

    result = analyze_behavior(data)

    return {
        "success": True,
        **result
    }