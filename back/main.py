from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "PreCoach API is running"}