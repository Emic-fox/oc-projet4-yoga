package com.openclassrooms.starterjwt.exception;

import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // Handles our own ApiException subclasses directly, instead of letting them
    // fall through to ResponseStatusExceptionResolver's sendError(), which loses
    // the SecurityContext and turns the status into a 401. Returns a ProblemDetail
    // so error responses share the same shape as ResponseEntityExceptionHandler's
    // own handling (e.g. @Valid failures).
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Object> handleApiException(ApiException ex, WebRequest request) {
        ResponseStatus responseStatus = AnnotatedElementUtils.findMergedAnnotation(ex.getClass(), ResponseStatus.class);
        if (responseStatus == null) {
            // Should not happen: every ApiException subclass declares @ResponseStatus.
            throw ex;
        }

        HttpStatus status = responseStatus.value();
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = !responseStatus.reason().isEmpty() ? responseStatus.reason() : status.getReasonPhrase();
        }

        ProblemDetail body = super.createProblemDetail(ex, status, message, null, null, request);

        return super.handleExceptionInternal(ex, body, new HttpHeaders(), status, request);
    }
}
